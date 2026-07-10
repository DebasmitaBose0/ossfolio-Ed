-- Migration: Add Most Improved sorting to the Leaderboard
-- 1. Add score_delta_30_days column to profiles table
alter table public.profiles
  add column if not exists score_delta_30_days integer not null default 0;

create index if not exists idx_profiles_score_delta_30_days_desc
  on public.profiles (score_delta_30_days desc nulls last);

-- 2. Create the profile_score_snapshots table
create table if not exists public.profile_score_snapshots (
  id            bigint generated always as identity primary key,
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  score         integer not null,
  snapshot_date date not null default current_date,
  constraint profile_score_snapshots_profile_date_idx unique (profile_id, snapshot_date)
);

alter table public.profile_score_snapshots enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profile_score_snapshots' and policyname = 'Snapshots are publicly viewable'
  ) then
    create policy "Snapshots are publicly viewable"
      on public.profile_score_snapshots for select using (true);
  end if;
end
$$;

create index if not exists idx_profile_score_snapshots_date on public.profile_score_snapshots(snapshot_date);

-- 3. Create the take_score_snapshots function
create or replace function public.take_score_snapshots()
returns void
language plpgsql
security definer
as $$
begin
  -- 1. Insert/update today's snapshot for all profiles
  insert into public.profile_score_snapshots (profile_id, score, snapshot_date)
  select id, score, current_date
  from public.profiles
  on conflict (profile_id, snapshot_date) do update
  set score = excluded.score;

  -- 2. Update the score_delta_30_days column for all profiles
  with historic_scores as (
    select distinct on (profile_id)
      profile_id,
      score as historic_score
    from public.profile_score_snapshots
    where snapshot_date <= current_date - 30
    order by profile_id, snapshot_date desc
  ),
  earliest_scores as (
    select distinct on (profile_id)
      profile_id,
      score as earliest_score
    from public.profile_score_snapshots
    order by profile_id, snapshot_date asc
  )
  update public.profiles p
  set score_delta_30_days = greatest(0, p.score - coalesce(sub.historic_score, sub.earliest_score, p.score))
  from (
    select 
      p_sub.id,
      h.historic_score,
      e.earliest_score
    from public.profiles p_sub
    left join historic_scores h on h.profile_id = p_sub.id
    left join earliest_scores e on e.profile_id = p_sub.id
  ) sub
  where p.id = sub.id;
end;
$$;

-- 4. Enable pg_cron extension
create extension if not exists pg_cron;

-- 5. Schedule the cron job to run daily at midnight
select cron.schedule(
  'daily-score-snapshot',
  '0 0 * * *',
  'select public.take_score_snapshots();'
);

-- 6. Run once immediately to seed today's snapshots and compute initial deltas
select public.take_score_snapshots();
