create table public.payout_events(id bigint generated always as identity primary key,payout_id uuid not null references public.payout_requests(id),seller_id uuid not null references public.profiles(id),actor_id uuid references public.profiles(id),action text not null check(action in('requested','approved','rejected','paid')),amount bigint not null,created_at timestamptz not null default now());
alter table public.payout_events enable row level security;
revoke all on public.payout_events from anon,authenticated;
grant select on public.payout_events to authenticated;
grant all on public.payout_events to service_role;
grant usage on sequence public.payout_events_id_seq to service_role;
create policy own_payout_events on public.payout_events for select to authenticated using(seller_id=auth.uid() or public.is_admin());
create or replace function public.request_payout(p_seller uuid,p_amount bigint) returns public.payout_requests language plpgsql security definer set search_path=public as $$ declare r public.payout_requests;b public.seller_balances;begin
 select * into b from public.seller_balances where seller_id=p_seller for update;if not found or p_amount<=0 or p_amount>b.available then raise exception 'BALANCE_INSUFFICIENT';end if;
 update public.seller_balances set available=available-p_amount,reserved=reserved+p_amount,updated_at=now() where seller_id=p_seller;
 insert into public.payout_requests(seller_id,amount) values(p_seller,p_amount) returning * into r;
 insert into public.payout_events(payout_id,seller_id,actor_id,action,amount) values(r.id,p_seller,p_seller,'requested',p_amount);return r;
end $$;
create function public.review_payout(p_actor uuid,p_id uuid,p_status text,p_reference text default null) returns public.payout_requests language plpgsql security definer set search_path=public as $$ declare r public.payout_requests;begin
 if not exists(select 1 from profiles where id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED';end if;
 select * into r from payout_requests where id=p_id for update;if not found then raise exception 'PAYOUT_NOT_FOUND';end if;
 if r.status=p_status then return r;end if;
 if not ((r.status='requested' and p_status in('approved','rejected')) or (r.status='approved' and p_status in('paid','rejected'))) then raise exception 'PAYOUT_STATE_INVALID';end if;
 if p_status='paid' and (p_reference is null or length(trim(p_reference))<5) then raise exception 'PAYOUT_REFERENCE_REQUIRED';end if;
 perform 1 from seller_balances where seller_id=r.seller_id and reserved>=r.amount for update;if not found then raise exception 'BALANCE_INSUFFICIENT';end if;
 if p_status='rejected' then update seller_balances set available=available+r.amount,reserved=reserved-r.amount,updated_at=now() where seller_id=r.seller_id;
 elsif p_status='paid' then update seller_balances set reserved=reserved-r.amount,updated_at=now() where seller_id=r.seller_id;end if;
 update payout_requests set status=p_status where id=r.id returning * into r;
 insert into payout_events(payout_id,seller_id,actor_id,action,amount) values(r.id,r.seller_id,p_actor,p_status,r.amount);
 insert into audit_logs(actor_id,action,entity_id,metadata) values(p_actor,'payout_reviewed',r.id,jsonb_build_object('status',p_status,'reference',p_reference));return r;
end $$;
revoke all on function public.review_payout(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.review_payout(uuid,uuid,text,text) to service_role;
