-- CPU editor derivatives: originals and inference leases are untouched.
create table public.artifact_versions (
 id uuid primary key default gen_random_uuid(), artifact_id uuid not null references public.artifacts(id),
 owner_id uuid not null references public.profiles(id), parent_id uuid references public.artifact_versions(id),
 idempotency_key uuid not null unique, version_number int, status text not null default 'pending' check(status in ('pending','ready')),
 storage_path text not null unique, declared_bytes bigint not null check(declared_bytes between 28 and 67108864),
 expected_sha text not null check(expected_sha ~ '^[0-9a-f]{64}$'), size_bytes bigint, sha256 text, quality jsonb, operations jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(), unique(artifact_id,version_number)
);
alter table public.artifact_versions enable row level security;
revoke all on public.artifact_versions from anon,authenticated;
grant select on public.artifact_versions to authenticated;
create policy own_versions on public.artifact_versions for select to authenticated using(owner_id=auth.uid());
grant all on public.artifact_versions to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('asset-versions','asset-versions',false,67108864,array['model/gltf-binary']) on conflict(id) do nothing;
create function public.reserve_artifact_version(p_artifact uuid,p_owner uuid,p_key uuid,p_parent uuid,p_size bigint,p_operations jsonb,p_sha text default null)
returns public.artifact_versions language plpgsql security definer set search_path=public,pg_temp as $$
declare a public.artifacts;v public.artifact_versions;begin
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,0));
 select * into a from public.artifacts where id=p_artifact and owner_id=p_owner for update;
 if not found then raise exception 'ASSET_NOT_FOUND';end if;
 select * into v from public.artifact_versions where idempotency_key=p_key and owner_id=p_owner;
 if found then
  if v.artifact_id!=p_artifact or v.parent_id is distinct from p_parent or v.declared_bytes!=p_size or v.operations!=p_operations or v.expected_sha is distinct from p_sha then raise exception 'IDEMPOTENCY_MISMATCH';end if;
  return v;
 end if;
 if p_parent is not null and not exists(select 1 from public.artifact_versions where id=p_parent and artifact_id=a.id and owner_id=p_owner and status='ready') then raise exception 'VERSION_NOT_FOUND';end if;
 if p_sha is null or p_sha !~ '^[0-9a-f]{64}$' or p_size<28 or p_size>67108864 or jsonb_typeof(p_operations)!='array' or jsonb_array_length(p_operations)>80 then raise exception 'VERSION_INVALID';end if;
 if (select count(*) from public.artifact_versions where owner_id=p_owner)>=100 or
 (select coalesce(sum(case when status='pending' then 67108864 else size_bytes end),0) from public.artifact_versions where owner_id=p_owner)+67108864>268435456 then raise exception 'EDITOR_STORAGE_QUOTA';end if;
 insert into public.artifact_versions(artifact_id,owner_id,parent_id,idempotency_key,declared_bytes,operations,expected_sha,storage_path)
 values(a.id,p_owner,p_parent,p_key,p_size,p_operations,p_sha,p_owner::text||'/'||a.id::text||'/versions/'||gen_random_uuid()::text||'.glb') returning * into v;
 return v;
end $$;
create function public.finalize_artifact_version(p_id uuid,p_owner uuid,p_size bigint,p_sha text,p_quality jsonb)
returns public.artifact_versions language plpgsql security definer set search_path=public,pg_temp as $$
declare v public.artifact_versions;begin
 -- Same lock order as reserve. Serializes numbering and owner quota accounting.
 perform pg_advisory_xact_lock(hashtextextended(p_owner::text,0));
 select * into v from public.artifact_versions where id=p_id and owner_id=p_owner for update;
 if not found then raise exception 'VERSION_NOT_FOUND';end if;
 perform 1 from public.artifacts where id=v.artifact_id and owner_id=p_owner for update;
 if not found then raise exception 'ASSET_NOT_FOUND';end if;
 if v.status='ready' then return v;end if;
 if p_size!=v.declared_bytes or p_size>67108864 or p_sha is distinct from v.expected_sha or
 not coalesce((p_quality->>'triangles')::bigint>0,false) or not coalesce((p_quality->>'uv_count')::bigint>0,false) or not coalesce((p_quality->>'texture_bytes')::bigint>0,false) then raise exception 'VERSION_INVALID';end if;
 update public.artifact_versions set status='ready',version_number=(select coalesce(max(version_number),0)+1 from public.artifact_versions where artifact_id=v.artifact_id),size_bytes=p_size,sha256=p_sha,quality=p_quality where id=v.id returning * into v;
 insert into public.audit_logs(actor_id,action,entity_id,metadata) values(p_owner,'artifact_version_created',v.id,jsonb_build_object('artifact_id',v.artifact_id,'version',v.version_number));
 return v;
end $$;
revoke all on function public.reserve_artifact_version(uuid,uuid,uuid,uuid,bigint,jsonb,text),public.finalize_artifact_version(uuid,uuid,bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.reserve_artifact_version(uuid,uuid,uuid,uuid,bigint,jsonb,text),public.finalize_artifact_version(uuid,uuid,bigint,text,jsonb) to service_role;
