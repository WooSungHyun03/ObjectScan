-- Configured packages only: no invented public price or automatic live payment.
create table public.credit_packages(id text primary key check(id ~ '^[a-z0-9-]{1,40}$'),name text not null,credits bigint not null check(credits>0),amount bigint not null check(amount between 100 and 100000000),enabled boolean not null default false);
alter table public.credit_packages enable row level security;
create policy packages_read on public.credit_packages for select to anon,authenticated using(enabled);
grant select on public.credit_packages to anon,authenticated;
grant all on public.credit_packages to service_role;
alter table public.orders drop constraint orders_kind_check;
alter table public.orders add constraint orders_kind_check check(kind in ('generation','marketplace','credits'));
alter table public.orders add column credit_units bigint check(credit_units>0);
alter table public.orders drop constraint orders_check1;
alter table public.orders add constraint orders_product_check check((kind='generation' and project_id is not null and listing_id is null and credit_units is null) or (kind='marketplace' and listing_id is not null and project_id is null and credit_units is null) or (kind='credits' and project_id is null and listing_id is null and credit_units is not null));
alter table public.wallet_entries drop constraint wallet_entries_kind_check;
alter table public.wallet_entries add constraint wallet_entries_kind_check check(kind in ('trial','generation','recovery','topup'));
alter table public.wallet_entries add column order_id uuid unique references public.orders(id);
-- Preserve tested marketplace settlement unchanged; isolate the new credit-order branch.
alter function public.settle_payment(uuid,text,bigint,boolean) rename to settle_transaction_payment;
create function public.settle_payment(p_order uuid,p_key text,p_amount bigint,p_test boolean) returns public.orders language plpgsql security definer set search_path=public,pg_temp as $$ declare o public.orders;begin
 select * into o from public.orders where id=p_order for update;
 if not found or o.amount!=p_amount then raise exception 'AMOUNT_MISMATCH';end if;
 if o.kind!='credits' then return public.settle_transaction_payment(p_order,p_key,p_amount,p_test);end if;
 if not p_test then raise exception 'TEST_PAYMENT_REQUIRED';end if;
 if o.status='paid' then
  if exists(select 1 from public.payments where order_id=o.id and payment_key=p_key and test_mode) then return o;end if;
  raise exception 'PAYMENT_MISMATCH';
 end if;
 if o.status not in ('pending','confirming') then raise exception 'ORDER_STATE_INVALID';end if;
 insert into public.payments(order_id,buyer_id,payment_key,amount,status,test_mode) values(o.id,o.buyer_id,p_key,p_amount,'DONE',true);
 insert into public.credit_wallets(user_id,balance) values(o.buyer_id,o.credit_units) on conflict(user_id) do update set balance=credit_wallets.balance+excluded.balance;
 insert into public.wallet_entries(user_id,order_id,kind,credits) values(o.buyer_id,o.id,'topup',o.credit_units);
 update public.orders set status='paid' where id=o.id returning * into o;return o;
end $$;
revoke all on function public.settle_payment(uuid,text,bigint,boolean) from public,anon,authenticated;
grant execute on function public.settle_payment(uuid,text,bigint,boolean) to service_role;
