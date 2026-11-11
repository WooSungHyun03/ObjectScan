-- Optional owner allowlist qualifies actual end-to-end runs before public activation.
create or replace function public.enqueue_job(p_project uuid,p_owner uuid,p_kind text,p_key uuid,p_order uuid default null) returns public.jobs language plpgsql security definer set search_path=public,pg_temp as $$ declare p public.projects;j public.jobs;m text;o public.orders; cost bigint;begin
 select * into j from public.jobs where idempotency_key=p_key and owner_id=p_owner;if found then return j;end if;
 select * into p from public.projects where id=p_project and owner_id=p_owner for update;if not found then raise exception 'PROJECT_NOT_FOUND';end if;
 if exists(select 1 from public.jobs where project_id=p.id and state not in ('completed','failed','cancelled')) then raise exception 'PROJECT_BUSY';end if;
 if (select count(*) from public.jobs where state not in ('completed','failed','cancelled'))>=5 then raise exception 'QUEUE_FULL';end if;
 if p.input_image_count<1 or not exists(select 1 from public.project_images where project_id=p.id and status='verified' and not excluded) then raise exception 'NO_INPUTS';end if;
 m:=case when p.mode='scene' then 'gaussian_wrapping' when p.input_image_count<=20 then 'pixal3d' else 'object_aware_loss' end;
 if p_kind='masks' and (p.mode!='object' or p.target_selection is null) then raise exception 'TARGET_REQUIRED';end if;
 if p_kind='generation' then
   if not (select value ? m from public.app_config where key='validated_models') then raise exception 'MODEL_NOT_VALIDATED';end if;
   if not exists(select 1 from public.app_config c,jsonb_array_elements(c.value) v where c.key='validated_profiles' and v->>'model'=m and p.input_image_count between (v->>'min_images')::int and (v->>'max_images')::int and (not(v ? 'owner_ids') or (v->'owner_ids') ? p_owner::text)) then raise exception 'INPUT_PROFILE_NOT_VALIDATED';end if;
   if p_order is not null then
    select * into o from public.orders where id=p_order and buyer_id=p_owner and kind='generation' and project_id=p.id and status='paid' for update;
    if not found or o.project_revision!=p.revision or o.image_count!=p.input_image_count then raise exception 'PAID_ORDER_REQUIRED';end if;
   else
    select credits into cost from public.generation_credit_rates where mode=p.mode and min_images=((p.input_image_count-1)/20)*20+1 and enabled;
    if cost is null then raise exception 'PRICE_NOT_CONFIGURED';end if;
    update public.credit_wallets set balance=balance-cost where user_id=p_owner and balance>=cost;
    if not found then raise exception 'BALANCE_INSUFFICIENT';end if;
   end if;
   if p.capture_mode='turntable' then raise exception 'TURNTABLE_NOT_VALIDATED';end if;
   if p.mode='scene' and p.input_image_count<20 then raise exception 'SCENE_EXPERIMENTAL';end if;
   if not (p.mode='object' and p.input_image_count=1) and p.pose_report is null then raise exception 'POSE_REQUIRED';end if;
   if p.mode='object' and exists(select 1 from public.project_images i left join public.object_masks m on m.image_id=i.id where i.project_id=p.id and i.status='verified' and not i.excluded and (m.id is null or not m.reviewed or m.revision!=p.revision)) then raise exception 'MASK_REVIEW_REQUIRED';end if;
 end if;
 insert into public.jobs(project_id,owner_id,kind,model,project_revision,idempotency_key,order_id) values(p.id,p_owner,p_kind,m,p.revision,p_key,p_order) returning * into j;
 if p_kind='generation' and p_order is null then insert into public.wallet_entries(user_id,job_id,kind,credits) values(p_owner,j.id,'generation',-cost);end if;
 insert into public.job_events(job_id,owner_id,stage,progress,message) values(j.id,p_owner,'queued',0,'작업이 대기열에 등록되었습니다.');return j;
end $$;

