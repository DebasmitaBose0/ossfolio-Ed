-- Scheduler lock table to prevent concurrent runs of the scheduled-refresh
-- edge function.  The function acquires a lock at the start of a run and
-- releases it when done.  Because the function can be invoked via cron at a
-- fixed interval (e.g. every 5 minutes), two overlapping invocations would
-- duplicate work and strain the GitHub API — this migration closes that gap.
--
-- A simple `INSERT ... ON CONFLICT DO NOTHING` with a TTL-check is enough:
-- there is only one schedule (single row, key = 'scheduled_refresh'), and
-- we treat any lock older than 10 minutes as stale and replace it.

create table if not exists public.scheduler_locks (
  key        text primary key,
  locked_at  timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '10 minutes'
);

comment on table public.scheduler_locks is
  'Exclusive locks for edge-function cron jobs. Each row guards one schedule.';

-- Allow the service-role (used by the edge function) to read & write the lock.
-- No other role needs access.
alter table public.scheduler_locks enable row level security;

create policy "service role can manage locks"
  on public.scheduler_locks
  using (true)
  with check (true);
