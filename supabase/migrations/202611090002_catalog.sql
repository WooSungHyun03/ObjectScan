alter table public.artifacts add column preview_path text;
create function public.record_target(p_project uuid,p_owner uuid,p_image uuid,p_selection jsonb) returns void language plpgsql security definer set search_path=public as $$ begin
 perform public.check_project_mutable(p_project);
 if not exists(select 1 from public.projects where id=p_project and owner_id=p_owner and mode='object') or not exists(select 1 from public.project_images where id=p_image and project_id=p_project and not excluded and status='verified') then raise exception 'TARGET_REQUIRED';end if;
 update public.projects set target_image_id=p_image,target_selection=p_selection,status='awaiting_mask_review',pose_report=null,revision=revision+1,updated_at=now() where id=p_project;
 delete from public.object_masks where project_id=p_project;delete from public.camera_poses where project_id=p_project;
end $$;
revoke all on function public.record_target(uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.record_target(uuid,uuid,uuid,jsonb) to service_role;
