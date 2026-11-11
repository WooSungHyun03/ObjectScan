-- Keep every recovery/debit cycle instead of deleting history on retry.
alter table public.wallet_entries add column attempt int not null default 0 check(attempt>=0);
alter table public.wallet_entries drop constraint wallet_entries_job_id_kind_key;
create unique index wallet_job_cycle_once on public.wallet_entries(job_id,kind,attempt);
create or replace function public.recover_job_credits() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$ declare charged bigint;cycle int;begin
 if new.state in ('failed','cancelled') and old.state not in ('failed','cancelled') then
  select -credits,attempt into charged,cycle from public.wallet_entries where job_id=new.id and kind='generation' order by attempt desc limit 1;
  if charged is not null then
   insert into public.wallet_entries(user_id,job_id,kind,credits,attempt) values(new.owner_id,new.id,'recovery',charged,cycle) on conflict(job_id,kind,attempt) do nothing;
   if found then update public.credit_wallets set balance=balance+charged where user_id=new.owner_id;end if;
  end if;
 elsif new.state='queued' and old.state in ('failed','cancelled') then
  select credits,attempt into charged,cycle from public.wallet_entries where job_id=new.id and kind='recovery' order by attempt desc limit 1;
  if charged is not null then
   update public.credit_wallets set balance=balance-charged where user_id=new.owner_id and balance>=charged;
   if not found then raise exception 'BALANCE_INSUFFICIENT';end if;
   insert into public.wallet_entries(user_id,job_id,kind,credits,attempt) values(new.owner_id,new.id,'generation',-charged,cycle+1);
  end if;
 end if;return new;end $$;
