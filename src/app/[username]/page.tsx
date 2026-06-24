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

interface GitHubUserData {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  blog: string | null;
  location: string | null;
  twitter_username: string | null;
  followers: number;
  following: number;
  public_repos: number;
  [key: string]: unknown;
}

type UserFetchResult =
  | { status: "ok"; data: GitHubUserData }
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
        headers: { Accept: "application/vnd.github.mercy-preview+json" },
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
      description: `Open-source profile for ${username}.`,
    };
  }
  const user = result.data;
  const displayName = user.name || username;
  const bio = user.bio || "";
  const publicRepos = user.public_repos;
  const followers = user.followers;
  const avatarUrl = user.avatar_url;

  const description = bio
    ? `${bio} | ${publicRepos} repos, ${followers} followers`
    : `${displayName} has ${publicRepos} public repos and ${followers} followers on GitHub.`;

  return {
    title: `${displayName} - OSSfolio`,
    description,
    openGraph: {
      title: `${displayName} - OSSfolio`,
      description,
      images: [{ url: avatarUrl, width: 400, height: 400, alt: `${displayName}'s avatar` }],
      type: "profile",
      siteName: "OSSfolio",
    },
    twitter: {
      card: "summary",
      title: `${displayName} - OSSfolio`,
      description,
      images: [avatarUrl],
    },
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
    const msg = userResult.code === 0
      ? `Network error while fetching profile for ${username}`
      : `GitHub API returned ${userResult.code} for ${username}`;
    throw new Error(msg);
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