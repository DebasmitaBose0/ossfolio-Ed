-- Strictify the privileges on public.profiles.
--
-- ── What the audit found ───────────────────────────────────────────────────────
--
-- The ROW-level policies are already sound, and were verified against PostgreSQL
-- rather than assumed:
--
--   profiles_select  for select using (true)                  -- profiles are public
--   profiles_insert  for insert with check (auth.uid() = id)
--   profiles_update  for update using  (auth.uid() = id)
--   (no delete policy)
--
--   * `profiles_update` looks like it is missing a WITH CHECK, but Postgres uses the
--     USING expression as the WITH CHECK when none is given. So a user genuinely
--     cannot rewrite their own `id` to someone else's: the new row is re-checked
--     against `auth.uid() = id` and the update is rejected. No change needed.
--   * Having no DELETE policy is not a gap either. RLS denies by default, so client
--     deletes are already blocked outright — stricter than a policy would be.
--
-- ── The real gap: privileges are ROW-level, not COLUMN-level ───────────────────
--
-- `profiles_update` lets a user update their own row — but that means EVERY COLUMN of
-- it. Supabase's anon key is public by design (it ships in the browser bundle as
-- NEXT_PUBLIC_SUPABASE_ANON_KEY), so any signed-in user could open a console and run:
--
--     supabase.from('profiles').update({ score: 999999, flagged: false }).eq('id', myId)
--
-- ...which tops the leaderboard AND clears their own anti-gaming flag. RLS happily
-- allows it: it is their own row. `score`, `total_*`, `flagged`, `flag_reason` and
-- `flagged_at` are all server-computed values that a client must never be able to write.
--
-- Postgres solves exactly this with column-level privileges, so that is what we use.
-- The score sync moves to POST /api/profile/sync, which recomputes the score on the
-- server from the *verified session's* identity and writes with the service-role key
-- (which bypasses RLS by design). A client can therefore no longer choose its own score
-- even in principle — not merely be forbidden from writing it.

-- Supabase grants blanket table privileges to `anon` and `authenticated` by default, and
-- relies on RLS alone to constrain them. Withdraw the write privileges and re-grant only
-- the columns a user legitimately owns. SELECT is untouched: profiles are public.
revoke insert, update, delete on public.profiles from anon, authenticated;

-- A signed-in user may edit their own presentation. Nothing here feeds the leaderboard,
-- the score, or the anti-gaming heuristic.
grant update (headline, pinned_repos, custom_links, visibility, badges)
  on public.profiles to authenticated;

-- Row creation is still allowed (profiles_insert already pins it to `auth.uid() = id`),
-- but a row may not be *born* with a forged score either — so the same column list, plus
-- the identity fields that are set once at signup.
grant insert (id, username, name, avatar_url, github_url, bio,
              headline, pinned_repos, custom_links, visibility, badges)
  on public.profiles to authenticated;

-- DELETE stays revoked. Nothing in the app deletes a profile from the client, and
-- `on delete cascade` from auth.users already removes the row when an account is deleted.

comment on table public.profiles is
  'Public profile. Presentation columns (headline, pinned_repos, custom_links, visibility, badges) are user-writable; score, total_*, flagged and flag_reason are server-computed and writable only with the service-role key.';
