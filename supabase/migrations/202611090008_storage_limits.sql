-- Originals have a separate transport limit; normalized images and GLBs cannot share that limit.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('original-uploads','original-uploads',false,16777216,array['image/jpeg','image/png','image/webp']),('job-results','job-results',false,134217728,array['model/gltf-binary','application/octet-stream']) on conflict(id) do nothing;
update storage.buckets set file_size_limit=67108864,allowed_mime_types=array['image/jpeg','image/png','image/webp'] where id='project-files';
create or replace function public.reserve_image(p_project uuid,p_owner uuid,p_filename text,p_mime text,p_bytes int,p_id uuid,p_path text) returns public.project_images language plpgsql security definer set search_path=public,pg_temp as $$ declare r public.project_images;n int;begin
 perform public.check_project_mutable(p_project);
 if not exists(select 1 from public.projects where id=p_project and owner_id=p_owner) then raise exception 'PROJECT_NOT_FOUND';end if;
 perform 1 from public.profiles where id=p_owner for update;
 select count(*) into n from public.project_images where project_id=p_project and status!='rejected';if n>=200 then raise exception 'IMAGE_LIMIT';end if;
 if (select coalesce(sum(case when status='verified' then size_bytes else 16777216 end),0) from public.project_images where owner_id=p_owner and (status!='rejected' or created_at>now()-interval '2 hours 10 minutes'))+16777216>1073741824 then raise exception 'STORAGE_LIMIT';end if;
 insert into public.project_images(id,project_id,owner_id,filename,mime,size_bytes,original_path,position) values(p_id,p_project,p_owner,p_filename,p_mime,p_bytes,p_path,n) returning * into r;return r;end $$;
