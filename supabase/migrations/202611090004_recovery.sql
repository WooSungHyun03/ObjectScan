create function public.retry_job(p_job uuid,p_owner uuid) returns public.jobs language plpgsql security definer set search_path=public as $$ declare j public.jobs;p public.projects;begin
 select * into j from public.jobs where id=p_job and owner_id=p_owner for update;if not found then raise exception 'JOB_NOT_FOUND';end if;
 if j.state='queued' then return j;end if;
 if j.state not in ('failed','cancelled') or j.attempts>=3 then raise exception 'JOB_TERMINAL';end if;
 if exists(select 1 from public.worker_slot where job_id=j.id) then raise exception 'GPU_STOP_NOT_CONFIRMED';end if;
 select * into p from public.projects where id=j.project_id for update;if p.revision!=j.project_revision then raise exception 'PROJECT_CHANGED';end if;
 if exists(select 1 from public.jobs where project_id=p.id and id!=j.id and state not in ('completed','failed','cancelled')) then raise exception 'PROJECT_BUSY';end if;
 update public.jobs set state='queued',progress=0,error_code=null,lease_token=null,lease_expires_at=null,updated_at=now() where id=j.id returning * into j;
 insert into public.job_events(job_id,owner_id,stage,progress,message) values(j.id,j.owner_id,'queued',0,'사용자가 기존 입력으로 재시도했습니다.');return j;
end $$;
revoke all on function public.retry_job(uuid,uuid) from public,anon,authenticated;
grant execute on function public.retry_job(uuid,uuid) to service_role;
