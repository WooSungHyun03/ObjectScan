-- Tombstone abandoned uploads before deleting Storage objects. Never collect verified input.
-- 25h also exceeds Supabase's documented 24h resumable-upload URL lifetime.
alter table public.project_images add column cleanup_started_at timestamptz,add column storage_deleted_at timestamptz;
create function public.claim_upload_cleanup(p_owner uuid default null,p_limit int default 25) returns setof public.project_images language plpgsql security definer set search_path=public,pg_temp as $$ begin
 return query with candidates as (
 select id from public.project_images where status in ('pending','rejected') and created_at<now()-interval '25 hours' and storage_deleted_at is null and (p_owner is null or owner_id=p_owner) and (cleanup_started_at is null or cleanup_started_at<now()-interval '5 minutes') order by created_at for update skip locked limit greatest(1,least(p_limit,100))
 ) update public.project_images i set status='rejected',cleanup_started_at=now() from candidates c where i.id=c.id returning i.*;
end $$;
revoke all on function public.claim_upload_cleanup(uuid,int) from public,anon,authenticated;
grant execute on function public.claim_upload_cleanup(uuid,int) to service_role;
create or replace function public.finalize_image(p_id uuid,p_owner uuid,p_width int,p_height int,p_sha text,p_normalized text) returns void language plpgsql security definer set search_path=public,pg_temp as $$ declare r public.project_images;begin
 select * into r from public.project_images where id=p_id and owner_id=p_owner for update;if not found then raise exception 'IMAGE_NOT_FOUND';end if;
 if r.cleanup_started_at is not null then raise exception 'IMAGE_EXPIRED';end if;
 if r.status='verified' then return;end if;
 perform public.check_project_mutable(r.project_id);
 update public.project_images set width=p_width,height=p_height,sha256=p_sha,normalized_path=p_normalized,status='verified' where id=p_id;
 update public.projects set input_image_count=(select count(*) from public.project_images where project_id=r.project_id and status='verified'),status='uploaded',revision=revision+1,pose_report=null,updated_at=now() where id=r.project_id;
end $$;
-- A rejected reservation still consumes its maximum until object deletion succeeds.
create or replace function public.reserve_image(p_project uuid,p_owner uuid,p_filename text,p_mime text,p_bytes int,p_id uuid,p_path text) returns public.project_images language plpgsql security definer set search_path=public,pg_temp as $$ declare r public.project_images;n int;begin
 perform public.check_project_mutable(p_project);
 if not exists(select 1 from public.projects where id=p_project and owner_id=p_owner) then raise exception 'PROJECT_NOT_FOUND';end if;
 perform 1 from public.profiles where id=p_owner for update;
 select count(*) into n from public.project_images where project_id=p_project and status!='rejected';if n>=200 then raise exception 'IMAGE_LIMIT';end if;
 if (select coalesce(sum(case when status='verified' then size_bytes else 16777216 end),0) from public.project_images where owner_id=p_owner and (status!='rejected' or storage_deleted_at is null))+16777216>1073741824 then raise exception 'STORAGE_LIMIT';end if;
 insert into public.project_images(id,project_id,owner_id,filename,mime,size_bytes,original_path,position) values(p_id,p_project,p_owner,p_filename,p_mime,p_bytes,p_path,n) returning * into r;return r;
end $$;
