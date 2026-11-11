-- Keep Preview test fees separate from existing production configuration.
insert into public.app_config(key,value) values('sandbox_commission_bps','null'::jsonb) on conflict do nothing;
