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
import { generateMockHeatmap } from "@/lib/mock";
import { calculateScore } from "@/lib/score";

export const runtime = "edge";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function fetchGitHubUser(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: { Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchGitHubRepos(username: string) {
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
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — OSSfolio`,
    description: `View ${username}'s open-source profile on OSSfolio.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Base profile + repos (already-working live data) plus the new live extras.
  // Each extra fetch fails soft (empty / zero) so a rate-limited Search call
  // never takes down the whole page.
  const [user, repos, liveStats, orgs] = await Promise.all([
    fetchGitHubUser(username),
    fetchGitHubRepos(username),
    fetchLiveStats(username),
    fetchOrganizations(username),
  ]);

  if (!user) notFound();

  const mappedRepos = mapRepos(repos);
  const techStack = deriveTechStack(repos);

  // Heatmap is not available from unauthenticated REST, so we use a seeded
  // placeholder and surface its total as the headline contribution count.
  const { weeks: heatmap, totalContributions } = generateMockHeatmap(username);

  const stats = { ...liveStats, totalContributions };
  const score = calculateScore(stats, mappedRepos);

  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
        <ProfileView
          user={user}
          repos={repos}
          stats={stats}
          techStack={techStack}
          orgs={orgs}
          heatmap={heatmap}
          totalContributions={totalContributions}
          score={score}
        />
      </main>
      <Footer />
    </>
  );
}
