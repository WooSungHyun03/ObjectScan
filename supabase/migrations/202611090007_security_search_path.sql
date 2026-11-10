-- Explicitly place pg_temp after public for every definer function; preserve existing RPC grants.
revoke create on schema public from public,anon,authenticated;
do $$ declare f record;begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef loop
  execute format('alter function %s set search_path = public, pg_temp',f.signature);
 end loop;
end $$;
