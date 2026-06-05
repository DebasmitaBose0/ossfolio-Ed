"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchContributorProfile, contributorToScoreInputs } from "@/lib/github";
import { mapRepos, fetchLiveStats } from "@/lib/profile-data";
import { calculateScore } from "@/lib/score";
import type { ContributorStats, Repo } from "@/types";

// Cap how long the post-login score sync may delay the redirect. The sync is
// best-effort (the profile page recomputes the score live as a fallback), so a
// slow GitHub/Supabase response must never hold the user on this screen.
const SYNC_TIMEOUT_MS = 4000;

// Unauthenticated REST pipeline — the same one the public profile page uses.
// Reviews aren't visible here (totalReviews stays 0), but it lets the score be
// stored even when the GraphQL/token path is unavailable or fails.
async function statsFromRest(
  username: string
): Promise<{ stats: ContributorStats; repos: Repo[] }> {
  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?sort=stars&per_page=12&type=owner`,
    { headers: { Accept: "application/vnd.github.v3+json" } }
  );
  const rawRepos = reposRes.ok ? await reposRes.json() : [];
  const filtered = Array.isArray(rawRepos)
    ? rawRepos.filter((r: { fork: boolean }) => !r.fork).slice(0, 6)
    : [];
  return { repos: mapRepos(filtered), stats: await fetchLiveStats(username) };
}

// Compute the user's score and persist it to their own profiles row. Prefers
// the authenticated GraphQL path (which includes review counts) and falls back
// to REST when the token is absent OR the GraphQL call fails, so a login always
// stores a score.
async function syncScore(
  userId: string,
  username: string,
  providerToken: string | undefined
): Promise<void> {
  let stats: ContributorStats;
  let repos: Repo[];

  if (providerToken) {
    try {
      const contributor = await fetchContributorProfile(username, providerToken);
      ({ stats, repos } = contributorToScoreInputs(contributor));
    } catch {
      // GraphQL failed (token expired, rate limit, network) — fall back to REST
      // rather than abandoning persistence for this login.
      ({ stats, repos } = await statsFromRest(username));
    }
  } else {
    ({ stats, repos } = await statsFromRest(username));
  }

  const score = calculateScore(stats, repos);

  // RLS ("Users can update/insert own profile", auth.uid() = id) permits this
  // with the anon client — no service-role key needed. upsert() resolves with
  // { error } rather than throwing, so check it explicitly instead of relying
  // on a surrounding try/catch.
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      username,
      score,
      total_commits: stats.totalCommits,
      total_prs: stats.totalPRs,
      total_issues: stats.totalIssues,
      total_reviews: stats.totalReviews,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) {
    // Non-fatal: surface for debugging but let sign-in proceed.
    console.error("Score sync upsert failed:", error.message);
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const username = session?.user?.user_metadata?.user_name as
        | string
        | undefined;
      const userId = session?.user?.id;
      // GitHub OAuth access token. Supabase only exposes this right after the
      // OAuth redirect (it isn't persisted or refreshed), which is why the
      // score sync runs here, at the callback, while the token is still in hand.
      const providerToken = session?.provider_token ?? undefined;

      if (username && userId) {
        // Best-effort and time-boxed: race the sync against a timeout so a slow
        // GitHub/Supabase response can't hold the redirect, and catch any error
        // so sign-in stays strictly non-blocking.
        await Promise.race([
          syncScore(userId, username, providerToken).catch(() => {}),
          new Promise<void>((resolve) => setTimeout(resolve, SYNC_TIMEOUT_MS)),
        ]);
      }

      if (!cancelled) {
        router.replace(username ? `/${username}` : "/");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      <p style={{ color: "#707070", fontSize: "14px" }}>Signing you in…</p>
    </div>
  );
}
