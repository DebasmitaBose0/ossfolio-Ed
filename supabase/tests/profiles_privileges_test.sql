-- Validation script for the privileges on public.profiles (issue #409).
--
-- Run against a database with the migrations applied:
--     psql "$DATABASE_URL" -f supabase/tests/profiles_privileges_test.sql
--
-- Every check raises an exception on failure, so a non-zero exit means a policy
-- regressed. It asserts both halves of the contract: that an attacker is blocked, and
-- that a legitimate user can still do what the app needs — a lockdown that also breaks
-- the product is not a fix.

\set ON_ERROR_STOP on

do $$
declare
  alice uuid := '11111111-1111-1111-1111-111111111111';
  bob   uuid := '22222222-2222-2222-2222-222222222222';
  v_score int;
  v_flagged boolean;
  v_headline text;
  v_id uuid;
  blocked boolean;
begin
  -- Seed two profiles with the service role (bypasses RLS, as the server does).
  delete from public.profiles where id in (alice, bob);
  insert into public.profiles (id, username, score, flagged, headline)
  values (alice, 'rls_test_alice', 100, true,  'alice headline'),
         (bob,   'rls_test_bob',   200, false, 'bob headline');

  -- Act as a signed-in user (Alice) coming through PostgREST.
  perform set_config('request.jwt.claim.sub', alice::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  set local role authenticated;

  ---------------------------------------------------------------------------
  -- 1. Alice must not be able to inflate her own score.
  ---------------------------------------------------------------------------
  blocked := false;
  begin
    update public.profiles set score = 999999 where id = alice;
  exception when insufficient_privilege then
    blocked := true;
  end;
  if not blocked then
    raise exception 'FAIL 1: a user was able to write their own `score`. The leaderboard is forgeable.';
  end if;

  ---------------------------------------------------------------------------
  -- 2. Alice must not be able to clear her own anti-gaming flag.
  ---------------------------------------------------------------------------
  blocked := false;
  begin
    update public.profiles set flagged = false, flag_reason = null where id = alice;
  exception when insufficient_privilege then
    blocked := true;
  end;
  if not blocked then
    raise exception 'FAIL 2: a user was able to clear their own `flagged` column. Anti-gaming is bypassable.';
  end if;

  ---------------------------------------------------------------------------
  -- 3. Alice must not be able to touch Bob's row at all (row-level policy).
  ---------------------------------------------------------------------------
  update public.profiles set headline = 'pwned' where id = bob;
  reset role;
  select headline into v_headline from public.profiles where id = bob;
  if v_headline <> 'bob headline' then
    raise exception 'FAIL 3: a user modified another user''s row.';
  end if;
  set local role authenticated;

  ---------------------------------------------------------------------------
  -- 4. Alice must not be able to hijack Bob by rewriting her own id.
  --    (This is the WITH-CHECK-defaults-to-USING behaviour, pinned by a test so a
  --     future edit to profiles_update cannot silently regress it.)
  ---------------------------------------------------------------------------
  blocked := false;
  begin
    update public.profiles set id = bob where id = alice;
  exception when insufficient_privilege or check_violation then
    blocked := true;
  end;
  if not blocked then
    reset role;
    select id into v_id from public.profiles where username = 'rls_test_alice';
    if v_id = bob then
      raise exception 'FAIL 4: a user rewrote their own id and hijacked another profile.';
    end if;
    set local role authenticated;
  end if;

  ---------------------------------------------------------------------------
  -- 5. Alice must not be able to delete anything.
  ---------------------------------------------------------------------------
  blocked := false;
  begin
    delete from public.profiles where id = alice;
  exception when insufficient_privilege then
    blocked := true;
  end;
  reset role;
  if not blocked and not exists (select 1 from public.profiles where id = alice) then
    raise exception 'FAIL 5: a user deleted a profile row from the client.';
  end if;
  set local role authenticated;

  ---------------------------------------------------------------------------
  -- 6. Alice MUST still be able to edit her own presentation — the app depends on it.
  ---------------------------------------------------------------------------
  update public.profiles set headline = 'alice edited' where id = alice;
  reset role;
  select headline into v_headline from public.profiles where id = alice;
  if v_headline <> 'alice edited' then
    raise exception 'FAIL 6: a user can no longer edit their own headline. The lockdown broke the product.';
  end if;

  ---------------------------------------------------------------------------
  -- 7. The server (service role) MUST still be able to write the score.
  ---------------------------------------------------------------------------
  update public.profiles set score = 321, flagged = false where id = alice;
  select score, flagged into v_score, v_flagged from public.profiles where id = alice;
  if v_score <> 321 or v_flagged then
    raise exception 'FAIL 7: the server can no longer write the score. The sync route is broken.';
  end if;

  delete from public.profiles where id in (alice, bob);
  raise notice 'ALL PROFILE PRIVILEGE CHECKS PASSED';
end $$;
