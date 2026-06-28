-- Add view_count and last_refreshed_at columns for background refresh system.
-- view_count tracks profile visits (for scheduled refresh prioritization).
-- last_refreshed_at tracks when GitHub data was last fetched (distinct from updated_at).

alter table public.profiles
  add column if not exists view_count integer not null default 0,
  add column if not exists last_refreshed_at timestamptz;

create index if not exists idx_profiles_view_count_desc
  on public.profiles (view_count desc nulls last);
