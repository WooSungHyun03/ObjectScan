-- ObjectScan v2: independent PostgreSQL metadata, private storage and one fenced GPU slot.
create extension if not exists pgcrypto;
create type public.reconstruction_mode as enum ('object','scene');
create type public.job_state as enum ('draft','uploaded','awaiting_mask_review','queued','preflight','pose_estimation','segmentation','reconstruction','meshing','texturing','validating','completed','failed','cancelled');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,display_name text not null default '',role text not null default 'user' check(role in ('user','admin')),created_at timestamptz not null default now());
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),80));return new;end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
create table public.projects(id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.profiles(id),name text not null check(length(name) between 1 and 80),mode public.reconstruction_mode not null,capture_mode text not null default 'camera_orbit' check(capture_mode in ('camera_orbit','turntable')),status public.job_state not null default 'draft',input_image_count int not null default 0 check(input_image_count between 0 and 200),revision int not null default 0,target_image_id uuid,target_selection jsonb,pose_report jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index projects_owner on public.projects(owner_id,updated_at desc);
create table public.project_images(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.projects(id) on delete cascade,owner_id uuid not null references public.profiles(id),filename text not null,mime text not null,size_bytes int not null check(size_bytes between 1 and 16777216),width int,height int,sha256 text,original_path text not null unique,normalized_path text,position int not null check(position between 0 and 199),excluded boolean not null default false,status text not null default 'pending' check(status in ('pending','verified','rejected')),created_at timestamptz not null default now(),unique(project_id,sha256));
create index images_project on public.project_images(project_id,position);
create table public.object_masks(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.projects(id),image_id uuid not null unique references public.project_images(id),owner_id uuid not null references public.profiles(id),storage_path text not null,reviewed boolean not null default false,foreground_ratio real not null check(foreground_ratio between .001 and .98),revision int not null,created_at timestamptz not null default now());
create table public.camera_poses(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.projects(id),image_id uuid not null references public.project_images(id),owner_id uuid not null references public.profiles(id),intrinsics jsonb not null,c2w jsonb not null,convention text not null check(convention='opengl_z_up'),revision int not null,unique(project_id,image_id));
create table public.pricing_tiers(id uuid primary key default gen_random_uuid(),mode public.reconstruction_mode not null,min_images int not null,max_images int not null,amount bigint not null check(amount>0),currency text not null default 'KRW' check(currency='KRW'),enabled boolean not null default false,unique(mode,min_images),check(min_images between 1 and 181 and (min_images-1)%20=0 and max_images=min_images+19));
create table public.app_config(key text primary key,value jsonb not null);
insert into public.app_config values ('validated_models','[]'),('commission_bps','null'),('payments_enabled','false');
create table public.jobs(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.projects(id),owner_id uuid not null references public.profiles(id),kind text not null check(kind in ('masks','poses','generation')),model text not null check(model in ('pixal3d','object_aware_loss','gaussian_wrapping')),state public.job_state not null default 'queued',progress int not null default 0 check(progress between 0 and 100),project_revision int not null,order_id uuid,lease_token uuid,lease_expires_at timestamptz,attempts int not null default 0 check(attempts between 0 and 3),error_code text,idempotency_key uuid not null unique,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index jobs_queue on public.jobs(created_at) where state='queued';
create unique index one_active_project_job on public.jobs(project_id) where state not in ('completed','failed','cancelled');
create table public.job_events(id bigint generated always as identity primary key,job_id uuid not null references public.jobs(id),owner_id uuid not null references public.profiles(id),stage public.job_state not null,progress int not null check(progress between 0 and 100),message text not null check(length(message)<=300),created_at timestamptz not null default now());
create table public.worker_slot(id int primary key check(id=1),job_id uuid references public.jobs(id),lease_token uuid,lease_expires_at timestamptz,last_heartbeat timestamptz,models jsonb not null default '[]',worker_id text);
insert into public.worker_slot(id) values(1);
create table public.artifacts(id uuid primary key default gen_random_uuid(),project_id uuid not null references public.projects(id),job_id uuid not null unique references public.jobs(id),owner_id uuid not null references public.profiles(id),name text not null,storage_path text not null unique,quality jsonb not null,created_at timestamptz not null default now());
create table public.marketplace_listings(id uuid primary key default gen_random_uuid(),artifact_id uuid not null unique references public.artifacts(id),seller_id uuid not null references public.profiles(id),title text not null check(length(title) between 1 and 100),description text not null default '',category text not null default 'objects' check(category in ('objects','scenes','furniture','decor','other')),price bigint not null check(price between 1 and 100000000),currency text not null default 'KRW' check(currency='KRW'),license text not null default 'standard',rights_consent_at timestamptz not null,status text not null default 'draft' check(status in ('draft','pending','approved','rejected','removed')),public_preview_path text,created_at timestamptz not null default now());
create table public.orders(id uuid primary key default gen_random_uuid(),buyer_id uuid not null references public.profiles(id),kind text not null check(kind in ('generation','marketplace')),project_id uuid references public.projects(id),listing_id uuid references public.marketplace_listings(id),project_revision int,image_count int,mode public.reconstruction_mode,amount bigint not null check(amount>0),fee bigint not null default 0 check(fee>=0 and fee<=amount),currency text not null default 'KRW' check(currency='KRW'),status text not null default 'pending' check(status in ('pending','confirming','paid','failed','refunded')),idempotency_key uuid not null unique,expires_at timestamptz not null default now()+interval '15 minutes',created_at timestamptz not null default now(),check((kind='generation' and project_id is not null and listing_id is null) or (kind='marketplace' and listing_id is not null and project_id is null)));
alter table public.jobs add constraint jobs_order foreign key(order_id) references public.orders(id);
create unique index generation_order_once on public.jobs(order_id) where order_id is not null;
create table public.payments(id uuid primary key default gen_random_uuid(),order_id uuid not null unique references public.orders(id),buyer_id uuid not null references public.profiles(id),provider text not null default 'toss',payment_key text not null unique,amount bigint not null,status text not null check(status in ('DONE','CANCELED')),test_mode boolean not null,confirmed_at timestamptz not null default now());
create table public.credit_ledger(id bigint generated always as identity primary key,user_id uuid not null references public.profiles(id),order_id uuid not null references public.orders(id),kind text not null check(kind in ('generation_purchase','marketplace_purchase','sale','fee','refund')),amount bigint not null,created_at timestamptz not null default now(),unique(order_id,user_id,kind));
create table public.asset_purchases(id uuid primary key default gen_random_uuid(),buyer_id uuid not null references public.profiles(id),artifact_id uuid not null references public.artifacts(id),order_id uuid not null unique references public.orders(id),revoked_at timestamptz,created_at timestamptz not null default now(),unique(buyer_id,artifact_id));
create table public.seller_balances(seller_id uuid primary key references public.profiles(id),available bigint not null default 0 check(available>=0),reserved bigint not null default 0 check(reserved>=0),updated_at timestamptz not null default now());
create table public.payout_requests(id uuid primary key default gen_random_uuid(),seller_id uuid not null references public.profiles(id),amount bigint not null check(amount>0),status text not null default 'requested' check(status in ('requested','approved','rejected','paid')),created_at timestamptz not null default now());
create table public.audit_logs(id bigint generated always as identity primary key,actor_id uuid references public.profiles(id),action text not null,entity_id uuid,metadata jsonb not null default '{}',created_at timestamptz not null default now());
create table public.rate_limits(key text primary key,count int not null,expires_at timestamptz not null);

-- RLS and privilege separation: browser clients cannot mutate processing/payment state.
alter table public.profiles enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy profile_edit on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
alter table public.projects enable row level security;
create policy project_read on public.projects for select to authenticated using(owner_id=auth.uid() or public.is_admin());
create policy project_create on public.projects for insert to authenticated with check(owner_id=auth.uid() and status='draft' and input_image_count=0 and revision=0 and target_selection is null and pose_report is null);
create policy project_rename on public.projects for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
-- All writes other than project create/rename/profile names use the authenticated server's service client after owner checks.
do $$ declare t text;begin
 foreach t in array array['project_images','object_masks','camera_poses','jobs','job_events','artifacts'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy owner_read on public.%I for select to authenticated using(owner_id=auth.uid() or public.is_admin())',t);
 end loop;
end $$;
create policy purchased_artifact_read on public.artifacts for select to authenticated using(exists(select 1 from public.asset_purchases p where p.artifact_id=artifacts.id and p.buyer_id=auth.uid() and p.revoked_at is null));
alter table public.marketplace_listings enable row level security;
create policy listing_public_read on public.marketplace_listings for select to anon,authenticated using(status='approved');
create policy listing_owner_read on public.marketplace_listings for select to authenticated using(seller_id=auth.uid() or public.is_admin());
alter table public.pricing_tiers enable row level security;
create policy prices_read on public.pricing_tiers for select to anon,authenticated using(enabled or public.is_admin());
alter table public.app_config enable row level security;
create policy commission_read on public.app_config for select to anon,authenticated using(key='commission_bps');
alter table public.orders enable row level security;
create policy orders_read on public.orders for select to authenticated using(buyer_id=auth.uid() or public.is_admin());
alter table public.payments enable row level security;
create policy payments_read on public.payments for select to authenticated using(buyer_id=auth.uid() or public.is_admin());
alter table public.credit_ledger enable row level security;
create policy ledger_read on public.credit_ledger for select to authenticated using(user_id=auth.uid() or public.is_admin());
alter table public.asset_purchases enable row level security;
create policy purchase_read on public.asset_purchases for select to authenticated using(buyer_id=auth.uid() or public.is_admin());
alter table public.seller_balances enable row level security;
create policy balance_read on public.seller_balances for select to authenticated using(seller_id=auth.uid() or public.is_admin());
alter table public.payout_requests enable row level security;
create policy payout_read on public.payout_requests for select to authenticated using(seller_id=auth.uid() or public.is_admin());
alter table public.audit_logs enable row level security;
create policy audit_admin_read on public.audit_logs for select to authenticated using(public.is_admin());
alter table public.worker_slot enable row level security;
alter table public.rate_limits enable row level security;
revoke all on all tables in schema public from anon,authenticated;
grant select on public.pricing_tiers,public.marketplace_listings,public.app_config to anon,authenticated;
grant select on public.profiles,public.projects,public.project_images,public.object_masks,public.camera_poses,public.jobs,public.job_events,public.artifacts,public.orders,public.credit_ledger,public.asset_purchases,public.seller_balances,public.payout_requests,public.audit_logs to authenticated;
grant insert(owner_id,name,mode,capture_mode) on public.projects to authenticated;
grant update(name) on public.projects to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- No public originals. Signed links are issued only by the owner/entitlement checked server.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('project-files','project-files',false,134217728,array['image/jpeg','image/png','image/webp','model/gltf-binary','application/octet-stream']);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('market-previews','market-previews',true,134217728,array['image/jpeg','image/png','image/webp','model/gltf-binary']);
-- No authenticated storage policies: clients upload only using short-lived exact-key signed upload tokens.

create function public.bump_project(p_project uuid) returns void language sql security definer set search_path=public as $$ update public.projects set revision=revision+1,updated_at=now(),pose_report=null where id=p_project $$;
create function public.check_project_mutable(p_project uuid) returns void language plpgsql security definer set search_path=public as $$ begin
 perform 1 from public.projects where id=p_project for update;if not found then raise exception 'PROJECT_NOT_FOUND';end if;
 if exists(select 1 from public.jobs where project_id=p_project and state not in ('completed','failed','cancelled')) then raise exception 'PROJECT_BUSY';end if;
 if exists(select 1 from public.orders where project_id=p_project and status in ('pending','confirming') and expires_at>now()) then raise exception 'ORDER_PENDING';end if;
end $$;
create function public.reserve_image(p_project uuid,p_owner uuid,p_filename text,p_mime text,p_bytes int,p_id uuid,p_path text) returns public.project_images language plpgsql security definer set search_path=public as $$ declare r public.project_images;n int;begin
 perform public.check_project_mutable(p_project);
 if not exists(select 1 from public.projects where id=p_project and owner_id=p_owner) then raise exception 'PROJECT_NOT_FOUND';end if;
 select count(*) into n from public.project_images where project_id=p_project and status!='rejected';if n>=200 then raise exception 'IMAGE_LIMIT';end if;
 if (select coalesce(sum(size_bytes),0) from public.project_images where owner_id=p_owner and status!='rejected')+p_bytes>1073741824 then raise exception 'STORAGE_LIMIT';end if;
 insert into public.project_images(id,project_id,owner_id,filename,mime,size_bytes,original_path,position) values(p_id,p_project,p_owner,p_filename,p_mime,p_bytes,p_path,n) returning * into r;return r;end $$;
create function public.finalize_image(p_id uuid,p_owner uuid,p_width int,p_height int,p_sha text,p_normalized text) returns void language plpgsql security definer set search_path=public as $$ declare r public.project_images;begin
 select * into r from public.project_images where id=p_id and owner_id=p_owner for update;if not found then raise exception 'IMAGE_NOT_FOUND';end if;if r.status='verified' then return;end if;
 perform public.check_project_mutable(r.project_id);
 update public.project_images set width=p_width,height=p_height,sha256=p_sha,normalized_path=p_normalized,status='verified' where id=p_id;
 update public.projects set input_image_count=(select count(*) from public.project_images where project_id=r.project_id and status='verified'),status='uploaded',revision=revision+1,pose_report=null,updated_at=now() where id=r.project_id;
end $$;
create function public.enqueue_job(p_project uuid,p_owner uuid,p_kind text,p_key uuid,p_order uuid default null) returns public.jobs language plpgsql security definer set search_path=public as $$ declare p public.projects;j public.jobs;m text;o public.orders;begin
 select * into j from public.jobs where idempotency_key=p_key and owner_id=p_owner;if found then return j;end if;
 select * into p from public.projects where id=p_project and owner_id=p_owner for update;if not found then raise exception 'PROJECT_NOT_FOUND';end if;
 if exists(select 1 from public.jobs where project_id=p.id and state not in ('completed','failed','cancelled')) then raise exception 'PROJECT_BUSY';end if;
 if (select count(*) from public.jobs where state not in ('completed','failed','cancelled'))>=5 then raise exception 'QUEUE_FULL';end if;
 if p.input_image_count<1 or not exists(select 1 from public.project_images where project_id=p.id and status='verified' and not excluded) then raise exception 'NO_INPUTS';end if;
 m:=case when p.mode='scene' then 'gaussian_wrapping' when p.input_image_count<=20 then 'pixal3d' else 'object_aware_loss' end;
 if p_kind='masks' and (p.mode!='object' or p.target_selection is null) then raise exception 'TARGET_REQUIRED';end if;
 if p_kind='generation' then
   if not (select value ? m from public.app_config where key='validated_models') then raise exception 'MODEL_NOT_VALIDATED';end if;
   select * into o from public.orders where id=p_order and buyer_id=p_owner and kind='generation' and project_id=p.id and status='paid' for update;
   if not found or o.project_revision!=p.revision or o.image_count!=p.input_image_count then raise exception 'PAID_ORDER_REQUIRED';end if;
   if p.capture_mode='turntable' then raise exception 'TURNTABLE_NOT_VALIDATED';end if;
   if p.mode='scene' and p.input_image_count<20 then raise exception 'SCENE_EXPERIMENTAL';end if;
   if not (p.mode='object' and p.input_image_count=1) and p.pose_report is null then raise exception 'POSE_REQUIRED';end if;
   if p.mode='object' and exists(select 1 from public.project_images i left join public.object_masks m on m.image_id=i.id where i.project_id=p.id and i.status='verified' and not i.excluded and (m.id is null or not m.reviewed or m.revision!=p.revision)) then raise exception 'MASK_REVIEW_REQUIRED';end if;
 end if;
 insert into public.jobs(project_id,owner_id,kind,model,project_revision,idempotency_key,order_id) values(p.id,p_owner,p_kind,m,p.revision,p_key,p_order) returning * into j;
 insert into public.job_events(job_id,owner_id,stage,progress,message) values(j.id,p_owner,'queued',0,'작업이 대기열에 등록되었습니다.');return j;
end $$;
create function public.claim_job(p_worker text,p_models jsonb) returns public.jobs language plpgsql security definer set search_path=public as $$ declare slot public.worker_slot;j public.jobs;t uuid:=gen_random_uuid();begin
 select * into slot from public.worker_slot where id=1 for update;
 -- Never recycle a slot on TTL alone: the previous GPU process may still exist.
 if slot.job_id is not null then return null;end if;
 select * into j from public.jobs where state='queued' and attempts<3 and (p_models ? model or (kind='masks' and p_models ? 'sam2') or (kind='poses' and p_models ? 'colmap')) order by created_at for update skip locked limit 1;
 if not found then return null;end if;
 update public.jobs set state='preflight',lease_token=t,lease_expires_at=now()+interval '120 seconds',attempts=attempts+1,updated_at=now() where id=j.id returning * into j;
 update public.worker_slot set job_id=j.id,lease_token=t,lease_expires_at=j.lease_expires_at,last_heartbeat=now(),worker_id=p_worker,models=p_models where id=1;
 insert into public.job_events(job_id,owner_id,stage,progress,message) values(j.id,j.owner_id,'preflight',0,'GPU 작업자가 작업을 수신했습니다.');return j;
end $$;
create function public.worker_heartbeat(p_job uuid,p_token uuid) returns boolean language plpgsql security definer set search_path=public as $$ begin
 perform 1 from public.worker_slot where id=1 and job_id=p_job and lease_token=p_token and lease_expires_at>now() for update;if not found then return false;end if;
 if not exists(select 1 from public.jobs where id=p_job and lease_token=p_token and state not in ('cancelled','failed','completed')) then return false;end if;
 update public.jobs set lease_expires_at=now()+interval '120 seconds',updated_at=now() where id=p_job;
 update public.worker_slot set last_heartbeat=now(),lease_expires_at=now()+interval '120 seconds' where id=1;return true;
end $$;
create function public.finish_job(p_job uuid,p_token uuid,p_state public.job_state,p_error text default null) returns void language plpgsql security definer set search_path=public as $$ declare j public.jobs;begin
 select * into j from public.jobs where id=p_job and lease_token=p_token for update;if not found then raise exception 'LEASE_INVALID';end if;
 if not exists(select 1 from public.worker_slot where id=1 and job_id=p_job and lease_token=p_token and lease_expires_at>now()) then raise exception 'LEASE_INVALID';end if;
 if p_state not in ('completed','failed','cancelled') or (p_state='completed' and j.state!='validating') then raise exception 'STATE_INVALID';end if;
 if j.state in ('completed','failed') then raise exception 'JOB_TERMINAL';end if;
 if p_state='completed' and j.kind='generation' and not exists(select 1 from public.artifacts where job_id=j.id) then raise exception 'ARTIFACT_REQUIRED';end if;
 update public.jobs set state=case when j.state='cancelled' then 'cancelled'::public.job_state else p_state end,progress=case when p_state='completed' then 100 else progress end,error_code=p_error,updated_at=now() where id=j.id;
 update public.worker_slot set job_id=null,lease_token=null,lease_expires_at=null,last_heartbeat=now() where id=1 and lease_token=p_token;
 insert into public.job_events(job_id,owner_id,stage,progress,message) values(j.id,j.owner_id,p_state,case when p_state='completed' then 100 else j.progress end,coalesce(p_error,'작업 종료 확인'));
end $$;
-- A verified processor response enters this service-role-only transaction. Clients cannot call it.
create function public.settle_payment(p_order uuid,p_key text,p_amount bigint,p_test boolean) returns public.orders language plpgsql security definer set search_path=public as $$ declare o public.orders;l public.marketplace_listings;begin
 select * into o from public.orders where id=p_order for update;if not found or o.amount!=p_amount then raise exception 'AMOUNT_MISMATCH';end if;
 if o.status='paid' then if exists(select 1 from public.payments where order_id=o.id and payment_key=p_key) then return o;else raise exception 'PAYMENT_MISMATCH';end if;end if;
 if o.status not in ('pending','confirming') then raise exception 'ORDER_STATE_INVALID';end if;
 insert into public.payments(order_id,buyer_id,payment_key,amount,status,test_mode) values(o.id,o.buyer_id,p_key,p_amount,'DONE',p_test);
 if o.kind='marketplace' then
 select * into l from public.marketplace_listings where id=o.listing_id for update;if not found or l.seller_id=o.buyer_id then raise exception 'LISTING_INVALID';end if;
 insert into public.asset_purchases(buyer_id,artifact_id,order_id) values(o.buyer_id,l.artifact_id,o.id);
 insert into public.credit_ledger(user_id,order_id,kind,amount) values(o.buyer_id,o.id,'marketplace_purchase',-o.amount),(l.seller_id,o.id,'sale',o.amount),(l.seller_id,o.id,'fee',-o.fee);
 -- Sandbox records do not create withdrawable real-money seller balances.
 if not p_test then insert into public.seller_balances(seller_id,available) values(l.seller_id,o.amount-o.fee) on conflict(seller_id) do update set available=seller_balances.available+excluded.available,updated_at=now();end if;
 else insert into public.credit_ledger(user_id,order_id,kind,amount) values(o.buyer_id,o.id,'generation_purchase',-o.amount);end if;
 update public.orders set status='paid' where id=o.id returning * into o;return o;
end $$;
create function public.request_payout(p_seller uuid,p_amount bigint) returns public.payout_requests language plpgsql security definer set search_path=public as $$ declare r public.payout_requests;b public.seller_balances;begin
 select * into b from public.seller_balances where seller_id=p_seller for update;if not found or p_amount<=0 or p_amount>b.available then raise exception 'BALANCE_INSUFFICIENT';end if;
 update public.seller_balances set available=available-p_amount,reserved=reserved+p_amount,updated_at=now() where seller_id=p_seller;
 insert into public.payout_requests(seller_id,amount) values(p_seller,p_amount) returning * into r;return r;
end $$;
create function public.check_rate(p_key text,p_max int) returns boolean language plpgsql security definer set search_path=public as $$ declare n int;k text:=p_key||':'||floor(extract(epoch from now())/60)::text;begin
 insert into public.rate_limits(key,count,expires_at) values(k,1,now()+interval '2 minutes') on conflict(key) do update set count=rate_limits.count+1 returning count into n;
 if random()<.01 then delete from public.rate_limits where expires_at<now();end if;return n<=p_max;end $$;
revoke all on all functions in schema public from public,anon,authenticated;
grant execute on function public.is_admin() to anon,authenticated,service_role;
grant execute on all functions in schema public to service_role;

create function public.mutate_image(p_id uuid,p_owner uuid,p_excluded boolean default null,p_position int default null) returns void language plpgsql security definer set search_path=public as $$ declare i public.project_images;n int;begin
 select * into i from public.project_images where id=p_id and owner_id=p_owner for update;if not found then raise exception 'IMAGE_NOT_FOUND';end if;perform public.check_project_mutable(i.project_id);
 if p_excluded is not null then update public.project_images set excluded=p_excluded where id=i.id;end if;
 if p_position is not null then
 select count(*) into n from public.project_images where project_id=i.project_id and status='verified';if p_position<0 or p_position>=n then raise exception 'POSITION_INVALID';end if;
 if p_position<i.position then update public.project_images set position=position+1 where project_id=i.project_id and position>=p_position and position<i.position;
 else update public.project_images set position=position-1 where project_id=i.project_id and position>i.position and position<=p_position;end if;
 update public.project_images set position=p_position where id=i.id;
 end if;
 perform public.bump_project(i.project_id);
 update public.object_masks set reviewed=false,revision=(select revision from public.projects where id=i.project_id) where project_id=i.project_id;
end $$;
revoke all on function public.mutate_image(uuid,uuid,boolean,int) from public,anon,authenticated;
grant execute on function public.mutate_image(uuid,uuid,boolean,int) to service_role;
create unique index one_market_order on public.orders(buyer_id,listing_id) where kind='marketplace' and status in ('pending','confirming','paid');
