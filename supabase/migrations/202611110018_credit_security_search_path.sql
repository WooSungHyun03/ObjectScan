-- Replacing the legacy enqueue body must retain its explicit temp-schema ordering.
alter function public.enqueue_job(uuid,uuid,text,uuid,uuid) set search_path=public,pg_temp;
