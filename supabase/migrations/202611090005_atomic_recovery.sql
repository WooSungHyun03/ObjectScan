-- Expired leases require an operator's explicit GPU-stop confirmation; serialize with claim.
create function public.reconcile_worker(p_actor uuid) returns void language plpgsql security definer set search_path=public as $$ declare s public.worker_slot;begin
 if not exists(select 1 from profiles where id=p_actor and role='admin') then raise exception 'ADMIN_REQUIRED';end if;
 select * into s from worker_slot where id=1 for update;
 if s.job_id is null then return;end if;
 if s.lease_expires_at>now() then raise exception 'LEASE_NOT_EXPIRED';end if;
 update jobs set state='failed',error_code='LEASE_EXPIRED',updated_at=now() where id=s.job_id and state not in ('completed','cancelled','failed');
 update worker_slot set job_id=null,lease_token=null,lease_expires_at=null where id=1;
 insert into audit_logs(actor_id,action,entity_id,metadata) values(p_actor,'lease_reconciled',s.job_id,'{"gpu_stopped":true}');
end $$;
revoke all on function public.reconcile_worker(uuid) from public,anon,authenticated;
grant execute on function public.reconcile_worker(uuid) to service_role;
-- Capabilities are specific to job kind: a generation model is not a segmentation/pose capability.
create or replace function public.claim_job(p_worker text,p_models jsonb) returns public.jobs language plpgsql security definer set search_path=public as $$ declare slot public.worker_slot;j public.jobs;t uuid:=gen_random_uuid();begin
 select * into slot from public.worker_slot where id=1 for update;
 if slot.job_id is not null then return null;end if;
 select * into j from public.jobs where state='queued' and attempts<3 and ((kind='generation' and p_models ? model) or (kind='masks' and p_models ? 'sam2') or (kind='poses' and p_models ? 'colmap')) order by created_at for update skip locked limit 1;
 if not found then return null;end if;
 update public.jobs set state='preflight',lease_token=t,lease_expires_at=now()+interval '120 seconds',attempts=attempts+1,updated_at=now() where id=j.id returning * into j;
 update public.worker_slot set job_id=j.id,lease_token=t,lease_expires_at=j.lease_expires_at,last_heartbeat=now(),worker_id=p_worker,models=p_models where id=1;
 insert into public.job_events(job_id,owner_id,stage,progress,message) values(j.id,j.owner_id,'preflight',0,'GPU 작업자가 작업을 수신했습니다.');return j;
end $$;
