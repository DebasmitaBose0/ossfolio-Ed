-- OSSfolio — Master Schema
-- Run this entire file in your Supabase SQL editor to set up the database.
-- Dashboard → SQL Editor → New query → paste → Run

-- ============================================================
-- PROFILES
-- One row per user. Extended from Supabase auth.users.
-- Populated automatically via trigger on signup.
-- ============================================================

create table public.profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  username   text not null unique,
  name       text,
  avatar_url text,
  github_url text,
  bio            text,
  followers      integer not null default 0,
  top_languages  text[] not null default '{}',
  score          integer not null default 0,
  total_commits  integer not null default 0,
  total_prs      integer not null default 0,
  total_issues   integer not null default 0,
  total_reviews  integer not null default 0,
  badges         jsonb not null default '[]'::jsonb,
  headline       text,
  pinned_repos   text[] not null default '{}',
  custom_links   jsonb not null default '[]'::jsonb,
  visibility     text not null default 'public' check (visibility in ('public', 'unlisted')),
  search_text    tsvector generated always as (
    to_tsvector('english',
      coalesce(username, '') || ' ' ||
      coalesce(name, '') || ' ' ||
      coalesce(bio, '') || ' ' ||
      array_to_string(top_languages, ' ')
    )
  ) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  view_count integer not null default 0,
  last_refreshed_at timestamptz
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly viewable"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- Runs after a new row is inserted into auth.users.
-- Pulls name, avatar_url, and user_name from raw_user_meta_data
-- (populated by GitHub OAuth or the signUp options.data field).
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, name, avatar_url, github_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'html_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SEARCH INDEXES
-- ============================================================

create index if not exists idx_profiles_search_text
  on public.profiles using gin (search_text);

create index if not exists idx_profiles_top_languages
  on public.profiles using gin (top_languages);

create index if not exists idx_profiles_score_desc
  on public.profiles (score desc nulls last);

create index if not exists idx_profiles_score_username
  on public.profiles(score desc, username asc);

create index if not exists idx_organizations_login
  on public.organizations(login);

create index if not exists idx_profiles_updated_at
  on public.profiles(updated_at desc);

-- ============================================================
-- SEARCH FUNCTION
-- Full-text search with language filter, score threshold, and sorting.
-- ============================================================

create or replace function public.search_profiles(
  query text default '',
  lang text default '',
  min_score integer default 0,
  sort_by text default 'score',
  page_size integer default 20,
  page_offset integer default 0
)
returns table (
  username text,
  name text,
  avatar_url text,
  bio text,
  score integer,
  total_prs integer,
  total_commits integer,
  total_issues integer,
  followers integer,
  top_languages text[]
)
language plpgsql security definer set search_path = public
as $$
begin
  return query
    select
      p.username,
      p.name,
      p.avatar_url,
      p.bio,
      p.score,
      p.total_prs,
      p.total_commits,
      p.total_issues,
      p.followers,
      p.top_languages
    from public.profiles p
    where
      (query = '' or p.search_text @@ plainto_tsquery('english', query))
      and (lang = '' or p.top_languages @> array[lang])
      and p.score >= min_score
    order by
      case when sort_by = 'score' then p.score else 0 end desc,
      case when sort_by = 'contributions' then (p.total_prs + p.total_commits + p.total_issues) else 0 end desc,
      case when sort_by = 'followers' then p.followers else 0 end desc,
      p.username asc
    limit least(page_size, 100)
    offset least(page_offset, 1000);
end;
$$;
