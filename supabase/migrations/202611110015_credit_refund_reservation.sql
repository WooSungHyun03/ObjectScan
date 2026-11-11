-- Reserve credit units before asking the provider to cancel: concurrent generation cannot spend them.
create table public.credit_refund_reservations(order_id uuid primary key references public.orders(id),user_id uuid not null references public.profiles(id),credits bigint not null check(credits>0),status text not null check(status in ('reserved','refunded')),created_at timestamptz not null default now());
alter table public.credit_refund_reservations enable row level security;
create policy refund_reservation_owner on public.credit_refund_reservations for select to authenticated using(user_id=auth.uid());
grant select on public.credit_refund_reservations to authenticated;
grant all on public.credit_refund_reservations to service_role;
alter table public.wallet_entries drop constraint wallet_entries_kind_check;
alter table public.wallet_entries add constraint wallet_entries_kind_check check(kind in ('trial','generation','recovery','topup','refund'));
alter table public.wallet_entries drop constraint wallet_entries_order_id_key;
create unique index wallet_order_kind_once on public.wallet_entries(order_id,kind);
create function public.reserve_credit_refund(p_order uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$ declare o public.orders;begin
 select * into o from public.orders where id=p_order for update;
 if not found or o.kind!='credits' or o.status!='paid' then raise exception 'ORDER_STATE_INVALID';end if;
 if not exists(select 1 from public.payments where order_id=o.id and test_mode) then raise exception 'TEST_PAYMENT_REQUIRED';end if;
 if exists(select 1 from public.credit_refund_reservations where order_id=o.id) then return;end if;
 update public.credit_wallets set balance=balance-o.credit_units where user_id=o.buyer_id and balance>=o.credit_units;
 if not found then raise exception 'BALANCE_INSUFFICIENT';end if;
 insert into public.credit_refund_reservations(order_id,user_id,credits,status) values(o.id,o.buyer_id,o.credit_units,'reserved');
end $$;
revoke all on function public.reserve_credit_refund(uuid) from public,anon,authenticated;
grant execute on function public.reserve_credit_refund(uuid) to service_role;
alter function public.settle_test_refund(uuid,text,bigint,text) rename to settle_transaction_refund;
create function public.settle_test_refund(p_order uuid,p_key text,p_amount bigint,p_transaction text) returns public.orders language plpgsql security definer set search_path=public,pg_temp as $$ declare o public.orders;begin
 select * into o from public.orders where id=p_order for update;
 if not found or o.amount!=p_amount then raise exception 'AMOUNT_MISMATCH';end if;
 if o.kind!='credits' then return public.settle_transaction_refund(p_order,p_key,p_amount,p_transaction);end if;
 if not exists(select 1 from public.payments where order_id=o.id and payment_key=p_key and test_mode) then raise exception 'TEST_PAYMENT_REQUIRED';end if;
 if o.status='refunded' then return o;end if;
 if o.status!='paid' or length(p_transaction)<1 then raise exception 'ORDER_STATE_INVALID';end if;
 perform public.reserve_credit_refund(o.id);
 insert into public.refunds(order_id,buyer_id,amount,provider_transaction) values(o.id,o.buyer_id,o.amount,p_transaction);
 insert into public.wallet_entries(user_id,order_id,kind,credits) values(o.buyer_id,o.id,'refund',-o.credit_units);
 update public.credit_refund_reservations set status='refunded' where order_id=o.id;
 update public.payments set status='CANCELED' where order_id=o.id;
 update public.orders set status='refunded' where id=o.id returning * into o;return o;
end $$;
revoke all on function public.settle_test_refund(uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.settle_test_refund(uuid,text,bigint,text) to service_role;
