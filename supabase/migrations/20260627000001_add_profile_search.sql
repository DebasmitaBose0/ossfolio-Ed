-- Add full-text search support to the profiles table.
-- Creates a generated tsvector column and a GIN index for fast queries.
-- Also adds a top_languages column for language-based filtering.

alter table public.profiles
  add column if not exists bio text,
  add column if not exists top_languages text[] not null default '{}',
  add column if not exists followers integer not null default 0,
  add column if not exists search_text tsvector
    generated always as (
      to_tsvector('english',
        coalesce(username, '') || ' ' ||
        coalesce(name, '') || ' ' ||
        coalesce(bio, '') || ' ' ||
        array_to_string(top_languages, ' ')
      )
    ) stored;

create index if not exists idx_profiles_search_text
  on public.profiles using gin (search_text);

create index if not exists idx_profiles_top_languages
  on public.profiles using gin (top_languages);

create index if not exists idx_profiles_score_desc
  on public.profiles (score desc nulls last);

-- Postgres function for searching profiles with filters.
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
