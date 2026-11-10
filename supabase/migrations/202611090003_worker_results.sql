create function public.commit_artifact(p_job uuid,p_token uuid,p_path text,p_quality jsonb,p_preview text default null) returns uuid language plpgsql security definer set search_path=public as $$ declare j public.jobs;a uuid;begin
 select * into j from public.jobs where id=p_job and lease_token=p_token and state='validating' for update;if not found or j.kind!='generation' then raise exception 'STATE_INVALID';end if;
 if not exists(select 1 from public.worker_slot where id=1 and job_id=p_job and lease_token=p_token and lease_expires_at>now()) then raise exception 'LEASE_INVALID';end if;
 if not (select value ? j.model from public.app_config where key='validated_models') then raise exception 'MODEL_NOT_VALIDATED';end if;
 insert into public.artifacts(project_id,job_id,owner_id,name,storage_path,quality,preview_path) select j.project_id,j.id,j.owner_id,p.name,p_path,p_quality,p_preview from public.projects p where p.id=j.project_id returning id into a;
 perform public.finish_job(p_job,p_token,'completed');update public.projects set status='completed',updated_at=now() where id=j.project_id;return a;
end $$;
create function public.commit_masks(p_job uuid,p_token uuid,p_masks jsonb) returns void language plpgsql security definer set search_path=public as $$ declare j public.jobs;m jsonb;n int;begin
 select * into j from public.jobs where id=p_job and lease_token=p_token and state='validating' and kind='masks' for update;if not found then raise exception 'STATE_INVALID';end if;
 if not exists(select 1 from public.projects where id=j.project_id and revision=j.project_revision and mode='object') then raise exception 'PROJECT_CHANGED';end if;
 select count(*) into n from public.project_images where project_id=j.project_id and not excluded and status='verified';if jsonb_array_length(p_masks)!=n then raise exception 'MASK_INVALID';end if;
 for m in select * from jsonb_array_elements(p_masks) loop
 if not exists(select 1 from public.project_images where id=(m->>'image_id')::uuid and project_id=j.project_id and not excluded and status='verified') then raise exception 'MASK_INVALID';end if;
 insert into public.object_masks(project_id,image_id,owner_id,storage_path,foreground_ratio,revision) values(j.project_id,(m->>'image_id')::uuid,j.owner_id,m->>'path',(m->>'ratio')::real,j.project_revision) on conflict(image_id) do update set storage_path=excluded.storage_path,foreground_ratio=excluded.foreground_ratio,reviewed=false,revision=excluded.revision;
 end loop;
 perform public.finish_job(p_job,p_token,'completed');update public.projects set status='awaiting_mask_review',updated_at=now() where id=j.project_id;
end $$;
create function public.commit_poses(p_job uuid,p_token uuid,p_report jsonb) returns void language plpgsql security definer set search_path=public as $$ declare j public.jobs;c jsonb;begin
 select * into j from public.jobs where id=p_job and lease_token=p_token and state='validating' and kind='poses' for update;if not found then raise exception 'STATE_INVALID';end if;
 if not exists(select 1 from public.projects where id=j.project_id and revision=j.project_revision) then raise exception 'PROJECT_CHANGED';end if;
 delete from public.camera_poses where project_id=j.project_id;
 for c in select * from jsonb_array_elements(p_report->'cameras') loop
 if not exists(select 1 from public.project_images where id=(c->>'image_id')::uuid and project_id=j.project_id and not excluded and status='verified') then raise exception 'POSE_REQUIRED';end if;
 insert into public.camera_poses(project_id,image_id,owner_id,intrinsics,c2w,convention,revision) values(j.project_id,(c->>'image_id')::uuid,j.owner_id,c-'c2w',c->'c2w',c->>'convention',j.project_revision);
 end loop;
 update public.projects set pose_report=p_report,updated_at=now() where id=j.project_id;perform public.finish_job(p_job,p_token,'completed');
end $$;
revoke all on function public.commit_artifact(uuid,uuid,text,jsonb,text),public.commit_masks(uuid,uuid,jsonb),public.commit_poses(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.commit_artifact(uuid,uuid,text,jsonb,text),public.commit_masks(uuid,uuid,jsonb),public.commit_poses(uuid,uuid,jsonb) to service_role;
