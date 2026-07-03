"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchFilters } from "@/components/discover/SearchFilters";
import { ProfileCard } from "@/components/discover/ProfileCard";
import Link from "next/link";

interface DiscoverProfile {
  username: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  score: number;
  total_prs: number;
  total_commits: number;
  total_issues: number;
  followers: number;
  top_languages: string[];
}

interface DiscoverResponse {
  profiles: DiscoverProfile[];
  page: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function DiscoverContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DiscoverResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProfiles() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        const q = searchParams.get("q");
        const lang = searchParams.get("lang");
        const sort = searchParams.get("sort");
        const minScore = searchParams.get("min_score");
        const page = searchParams.get("page");
        if (q) params.set("q", q);
        if (lang) params.set("lang", lang);
        if (sort) params.set("sort", sort);
        if (minScore) params.set("min_score", minScore);
        if (page) params.set("page", page);

        const resp = await fetch(`/api/discover?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body.error || `Failed to fetch (${resp.status})`);
        }
        const result: DiscoverResponse = await resp.json();
        setData(result);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchProfiles();
    return () => { controller.abort(); };
  }, [searchParams]);

  const pagerStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--color-ink)",
    backgroundColor: "var(--color-canvas)",
    border: "1px solid var(--color-hairline-strong)",
    borderRadius: "6px",
    padding: "8px 16px",
    textDecoration: "none",
  };

  const pagerDisabledStyle: React.CSSProperties = {
    ...pagerStyle,
    color: "var(--color-ink-faint)",
    borderColor: "var(--color-hairline)",
    pointerEvents: "none",
  };

  const currentPage = data?.page || 1;
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/discover?${params.toString()}`;
  };

  return (
    <>
      <SearchFilters />

      {loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "180px",
                borderRadius: "12px",
                backgroundColor: "var(--color-canvas-soft)",
                border: "1px solid var(--color-hairline)",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      )}

      {error && (
        <div
          style={{
            border: "1px solid rgba(252, 165, 165, 0.5)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            backgroundColor: "rgba(252, 165, 165, 0.1)",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--color-ink)", margin: 0 }}>{error}</p>
        </div>
      )}

      {!loading && !error && data && data.profiles.length === 0 && (
        <div
          style={{
            border: "1px solid var(--color-hairline)",
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--color-ink)", margin: 0 }}>
            No contributors found
          </p>
          <p style={{ fontSize: "14px", color: "var(--color-ink-mute-2)", margin: "6px 0 0 0" }}>
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {!loading && !error && data && data.profiles.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {data.profiles.map((profile) => (
              <ProfileCard
                key={profile.username}
                username={profile.username}
                name={profile.name}
                avatarUrl={profile.avatar_url}
                bio={profile.bio}
                score={profile.score}
                totalPrs={profile.total_prs}
                totalCommits={profile.total_commits}
                totalIssues={profile.total_issues}
                followers={profile.followers}
                topLanguages={profile.top_languages}
              />
            ))}
          </div>

          {(data.hasPrev || data.hasNext) && (
            <nav
              aria-label="Pagination"
              style={{
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {data.hasPrev ? (
                <Link href={buildPageUrl(currentPage - 1)} style={pagerStyle}>
                  Previous
                </Link>
              ) : (
                <span style={pagerDisabledStyle}>Previous</span>
              )}
              <span style={{ fontSize: "13px", color: "var(--color-ink-mute-2)" }}>Page {currentPage}</span>
              {data.hasNext ? (
                <Link href={buildPageUrl(currentPage + 1)} style={pagerStyle}>
                  Next
                </Link>
              ) : (
                <span style={pagerDisabledStyle}>Next</span>
              )}
            </nav>
          )}
        </>
      )}
    </>
  );
}
