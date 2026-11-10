-- Sandbox-only full refunds. Live refund/debt/payout reconciliation remains a separate launch gate.
create table public.refunds(id uuid primary key default gen_random_uuid(),order_id uuid not null unique references public.orders(id),buyer_id uuid not null references public.profiles(id),amount bigint not null check(amount>0),provider_transaction text not null unique,created_at timestamptz not null default now());
alter table public.refunds enable row level security;
revoke all on public.refunds from anon,authenticated;
grant select(id,order_id,buyer_id,amount,created_at) on public.refunds to authenticated;
grant all on public.refunds to service_role;
create policy own_refunds on public.refunds for select to authenticated using(buyer_id=auth.uid() or public.is_admin());
create function public.settle_test_refund(p_order uuid,p_key text,p_amount bigint,p_transaction text) returns public.orders language plpgsql security definer set search_path=public,pg_temp as $$ declare o public.orders;l public.marketplace_listings;begin
 select * into o from public.orders where id=p_order for update;if not found or o.amount!=p_amount then raise exception 'AMOUNT_MISMATCH';end if;
 if not exists(select 1 from public.payments where order_id=o.id and payment_key=p_key and test_mode) then raise exception 'TEST_PAYMENT_REQUIRED';end if;
 if o.status='refunded' then return o;end if;
 if o.status!='paid' or length(p_transaction)<1 then raise exception 'ORDER_STATE_INVALID';end if;
 insert into public.refunds(order_id,buyer_id,amount,provider_transaction) values(o.id,o.buyer_id,o.amount,p_transaction);
 insert into public.credit_ledger(user_id,order_id,kind,amount) values(o.buyer_id,o.id,'refund',o.amount);
 if o.kind='marketplace' then
  select * into l from public.marketplace_listings where id=o.listing_id;
  insert into public.credit_ledger(user_id,order_id,kind,amount) values(l.seller_id,o.id,'refund',-(o.amount-o.fee));
  update public.asset_purchases set revoked_at=now() where order_id=o.id;
 end if;
 update public.jobs set state='cancelled',updated_at=now() where order_id=o.id and state not in ('completed','failed','cancelled');
 -- A cancellation does not release worker_slot; the worker must first confirm process-group termination.
 update public.payments set status='CANCELED' where order_id=o.id;
 update public.orders set status='refunded' where id=o.id returning * into o;
 insert into public.audit_logs(actor_id,action,entity_id,metadata) values(o.buyer_id,'sandbox_refund_verified',o.id,jsonb_build_object('amount',o.amount));return o;
end $$;
revoke all on function public.settle_test_refund(uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.settle_test_refund(uuid,text,bigint,text) to service_role;
-- A refunded entitlement can be bought again; a refund only revokes the entitlement for its own order.
create or replace function public.settle_payment(p_order uuid,p_key text,p_amount bigint,p_test boolean) returns public.orders language plpgsql security definer set search_path=public,pg_temp as $$ declare o public.orders;l public.marketplace_listings;begin
 select * into o from public.orders where id=p_order for update;if not found or o.amount!=p_amount then raise exception 'AMOUNT_MISMATCH';end if;
 if o.status='paid' then if exists(select 1 from public.payments where order_id=o.id and payment_key=p_key) then return o;else raise exception 'PAYMENT_MISMATCH';end if;end if;
 if o.status not in ('pending','confirming') then raise exception 'ORDER_STATE_INVALID';end if;
 insert into public.payments(order_id,buyer_id,payment_key,amount,status,test_mode) values(o.id,o.buyer_id,p_key,p_amount,'DONE',p_test);
 if o.kind='marketplace' then
 select * into l from public.marketplace_listings where id=o.listing_id for update;if not found or l.seller_id=o.buyer_id then raise exception 'LISTING_INVALID';end if;
 insert into public.asset_purchases(buyer_id,artifact_id,order_id) values(o.buyer_id,l.artifact_id,o.id) on conflict(buyer_id,artifact_id) do update set order_id=excluded.order_id,revoked_at=null where asset_purchases.revoked_at is not null;
 if not found then raise exception 'ALREADY_OWNED';end if;
 insert into public.credit_ledger(user_id,order_id,kind,amount) values(o.buyer_id,o.id,'marketplace_purchase',-o.amount),(l.seller_id,o.id,'sale',o.amount),(l.seller_id,o.id,'fee',-o.fee);
 if not p_test then insert into public.seller_balances(seller_id,available) values(l.seller_id,o.amount-o.fee) on conflict(seller_id) do update set available=seller_balances.available+excluded.available,updated_at=now();end if;
 else insert into public.credit_ledger(user_id,order_id,kind,amount) values(o.buyer_id,o.id,'generation_purchase',-o.amount);end if;
 update public.orders set status='paid' where id=o.id returning * into o;return o;
end $$;
