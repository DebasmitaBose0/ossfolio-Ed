import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileView } from "@/components/profile/ProfileView";
import {
  fetchLiveStats,
  fetchOrganizations,
  deriveTechStack,
  mapRepos,
} from "@/lib/profile-data";
import { generateMockHeatmap, computeStreaks } from "@/lib/mock";
import { fetchContributionCalendar } from "@/lib/github";
import { calculateScore } from "@/lib/score";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

type UserFetchResult =
  | { status: "ok"; data: Record<string, unknown> }
  | { status: "not_found" }
  | { status: "error"; code: number };

async function fetchGitHubUser(username: string): Promise<UserFetchResult> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return { status: "not_found" };
    if (!res.ok) return { status: "error", code: res.status };
    return { status: "ok", data: await res.json() };
  } catch {
    return { status: "error", code: 0 };
  }
}

async function fetchGitHubRepos(username: string) {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=12&type=owner`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const repos = await res.json();
    return repos.filter((r: { fork: boolean }) => !r.fork).slice(0, 6);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const result = await fetchGitHubUser(username);
  if (result.status !== "ok") {
    return {
      title: `${username} - OSSfolio`,
      description: `View ${username}'s open-source profile on OSSfolio.`,
    };
  }
  const user = result.data;
  const displayName = (typeof user.name === "string" && user.name) || username;
  return {
    title: `${displayName} - OSSfolio`,
    description: `View ${displayName}'s open-source profile on OSSfolio.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Base profile + repos (already-working live data) plus the new live extras.
  const [userResult, repos, liveStats, orgs, contributionCalendar] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username),
    fetchLiveStats(username),
    fetchOrganizations(username),
    fetchContributionCalendar(username),
  ]);

  if (userResult.status === "not_found") notFound();
  if (userResult.status === "error") {
    throw new Error(`GitHub API returned ${userResult.code} for ${username}`);
  }
  const user = userResult.data;

  const mappedRepos = mapRepos(repos);
  const techStack = deriveTechStack(repos);

  // Heatmap calculation — use the user's real contribution calendar parsed from
  // GitHub's public endpoint. If that request failed (network error, rate limit,
  // markup change), fall back to the seeded placeholder so the page still renders.
  const { weeks: heatmap, totalContributions } = contributionCalendar
    ? contributionCalendar
    : generateMockHeatmap(username);

  // Streaks computation
  const { current: currentStreak, longest: longestStreak } = computeStreaks(heatmap);

  const stats = { ...liveStats, totalContributions };
  const liveScore = calculateScore(stats, mappedRepos);

  let score = liveScore;
  let updatedAt: string | null = null;
  try {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("score, updated_at")
      .eq("username", username)
      .maybeSingle();
    if (profileRow && typeof profileRow.score === "number") {
      score = profileRow.score;
    }
    if (profileRow && typeof profileRow.updated_at === "string") {
      updatedAt = profileRow.updated_at;
    }
  } catch {
    // Soft isolation fallback
  }

  return (
    <>
      <Navbar />
      {/* 💡 Fixed: Linked layout to design tokens and added transition curves */}
      <main 
        style={{ 
          backgroundColor: "var(--color-canvas)", 
          color: "var(--color-ink)",
          minHeight: "100vh",
          transition: "background-color 0.2s ease, color 0.2s ease"
        }}
      >
        <ProfileView
          user={user}
          repos={repos}
          stats={stats}
          techStack={techStack}
          orgs={orgs}
          heatmap={heatmap}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          score={score}
          updatedAt={updatedAt}
        />
      </main>
      <Footer />
    </>
  );
}