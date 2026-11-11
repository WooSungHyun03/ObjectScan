-- Disabled until an operator qualifies the release. At most configured verified accounts receive one grant.
insert into public.app_config(key,value) values('trial_credits','{"enabled":false,"credits":1,"max_accounts":2}') on conflict do nothing;
create unique index wallet_trial_once on public.wallet_entries(user_id) where kind='trial';
create function public.claim_trial_credits(p_owner uuid) returns bigint language plpgsql security definer set search_path=public,pg_temp as $$ declare cfg jsonb;units bigint;begin
 select value into cfg from public.app_config where key='trial_credits' for update;
 if not coalesce((cfg->>'enabled')::boolean,false) then raise exception 'TRIAL_UNAVAILABLE';end if;
 if not exists(select 1 from auth.users where id=p_owner and email_confirmed_at is not null and deleted_at is null) then raise exception 'AUTH_REQUIRED';end if;
 if exists(select 1 from public.wallet_entries where user_id=p_owner and kind='trial') then return (select balance from public.credit_wallets where user_id=p_owner);end if;
 units:=(cfg->>'credits')::bigint;
 if units not between 1 and 10000 or (select count(*) from public.wallet_entries where kind='trial')>=(cfg->>'max_accounts')::int then raise exception 'TRIAL_UNAVAILABLE';end if;
 insert into public.credit_wallets(user_id,balance) values(p_owner,units) on conflict(user_id) do update set balance=credit_wallets.balance+excluded.balance;
 insert into public.wallet_entries(user_id,kind,credits) values(p_owner,'trial',units);
 return (select balance from public.credit_wallets where user_id=p_owner);
end $$;
revoke all on function public.claim_trial_credits(uuid) from public,anon,authenticated;
grant execute on function public.claim_trial_credits(uuid) to service_role;
