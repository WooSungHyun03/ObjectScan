-- Additive purchase-time rights/source records. Legacy rows remain explicitly unknown.
alter table public.orders add column license_snapshot jsonb;
alter table public.asset_purchases add column license_snapshot jsonb;
create function public.freeze_order_terms() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare l public.marketplace_listings; a public.artifacts;
begin
 if tg_op='UPDATE' then
  if row(new.buyer_id,new.kind,new.project_id,new.listing_id,new.amount,new.fee,new.currency,new.license_snapshot)
    is distinct from row(old.buyer_id,old.kind,old.project_id,old.listing_id,old.amount,old.fee,old.currency,old.license_snapshot)
  then raise exception 'ORDER_TERMS_IMMUTABLE'; end if;
  return new;
 end if;
 if new.kind='marketplace' then
  select * into l from public.marketplace_listings where id=new.listing_id for share;
  if not found or new.amount<>l.price then raise exception 'AMOUNT_MISMATCH'; end if;
  select * into a from public.artifacts where id=l.artifact_id for share;
  if not found then raise exception 'ASSET_NOT_FOUND'; end if;
  new.license_snapshot=jsonb_build_object('schema_version',1,'license_code',l.license,
    'license_label',case l.license when 'standard' then '일반 이용 — 재판매·재배포 제외' when 'cc-by-4.0' then 'CC BY 4.0' when 'cc0-1.0' then 'CC0 1.0' else l.license end,
    'listing_title',l.title,'listing_description',l.description,'seller_id',l.seller_id,
    'rights_consent_at',l.rights_consent_at,'artifact_id',a.id,'source_version','original',
    'source_sha256',a.quality->>'sha256','source_storage_path',a.storage_path,'captured_at',now());
 end if;
 return new;
end $$;
create trigger order_terms_frozen before insert or update on public.orders for each row execute function public.freeze_order_terms();

create function public.freeze_market_source() returns trigger language plpgsql as $$
begin
 if new.artifact_id is distinct from old.artifact_id or new.seller_id is distinct from old.seller_id
 then raise exception 'LISTING_SOURCE_IMMUTABLE';end if;return new;
end $$;
create trigger listing_source_frozen before update on public.marketplace_listings for each row execute function public.freeze_market_source();

create function public.freeze_artifact_source() returns trigger language plpgsql as $$
begin
 if new.storage_path is distinct from old.storage_path then raise exception 'ARTIFACT_SOURCE_IMMUTABLE';end if;return new;
end $$;
create trigger artifact_source_frozen before update on public.artifacts for each row execute function public.freeze_artifact_source();

create function public.snapshot_purchase_terms() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.orders;
begin
 select * into o from public.orders where id=new.order_id;
 if not found or o.buyer_id<>new.buyer_id or o.kind<>'marketplace' then raise exception 'PURCHASE_ORDER_INVALID';end if;
 if o.license_snapshot is not null and o.license_snapshot->>'artifact_id'<>new.artifact_id::text then raise exception 'PURCHASE_SOURCE_MISMATCH';end if;
 new.license_snapshot=o.license_snapshot;return new;
end $$;
create trigger purchase_terms_snapshot before insert or update on public.asset_purchases for each row execute function public.snapshot_purchase_terms();
revoke all on function public.freeze_order_terms(),public.freeze_market_source(),public.freeze_artifact_source(),public.snapshot_purchase_terms() from public,anon,authenticated;
