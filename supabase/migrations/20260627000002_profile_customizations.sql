-- Profile customization columns for authenticated users.
-- Adds headline, pinned repos, custom links, and visibility control.

alter table public.profiles
  add column if not exists headline text,
  add column if not exists pinned_repos text[] not null default '{}',
  add column if not exists custom_links jsonb not null default '[]'::jsonb,
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'unlisted'));
