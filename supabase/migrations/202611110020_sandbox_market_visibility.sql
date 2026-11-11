-- Additive isolation: old clients and anon RLS still see only normal approved rows.
alter table public.marketplace_listings drop constraint marketplace_listings_status_check;
alter table public.marketplace_listings add constraint marketplace_listings_status_check
check(status in ('draft','pending','approved','rejected','removed','sandbox_draft','sandbox_pending','sandbox_approved','sandbox_rejected','sandbox_removed'));
