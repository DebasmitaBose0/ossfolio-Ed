import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Explore Contributors - OSSfolio",
  description:
    "The OSSfolio leaderboard - top open-source contributors ranked by their contribution score.",
};

const PAGE_SIZE = 50;

interface LeaderboardRow {
  username: string;
  name: string | null;
  avatar_url: string | null;
  score: number | null;
  total_prs: number | null;
  total_issues: number | null;
  total_commits: number | null;
}

interface ExplorePageProps {
  searchParams: Promise<{ page?: string; q?: string; sortBy?: string }>;
}

// Fetch one page of contributors ordered by stored score. Reads the same public
// `profiles` rows the profile page syncs on login (RLS allows public select), so
// signed-out visitors see the official numbers. We request one extra row beyond
// the page so we can tell whether a "next" page exists without a second count
// query. Fails soft to an empty array so a Supabase hiccup renders the empty
// state instead of crashing the page.
async function fetchPage(
  page: number,
  searchQuery: string,
  sortBy: string
): Promise<{ rows: LeaderboardRow[]; hasNext: boolean }> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE; // inclusive range of PAGE_SIZE + 1 rows
  try {
    let query = supabase
      .from("profiles")
      .select(
        "username, name, avatar_url, score, total_prs, total_issues, total_commits"
      );

    if (searchQuery) {
      query = query.or(`username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`);
    }

    // Determine ordering column based on sort parameter
    let orderColumn = "score";
    if (sortBy === "prs") orderColumn = "total_prs";
    else if (sortBy === "commits") orderColumn = "total_commits";
    else if (sortBy === "issues") orderColumn = "total_issues";

    query = query
      .order(orderColumn, { ascending: false })
      .order("updated_at", { ascending: false })
      .order("username", { ascending: true })
      .range(from, to);

    const { data, error } = await query;
    if (error || !Array.isArray(data)) return { rows: [], hasNext: false };
    const hasNext = data.length > PAGE_SIZE;
    return { rows: (data as LeaderboardRow[]).slice(0, PAGE_SIZE), hasNext };
  } catch {
    return { rows: [], hasNext: false };
  }
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { page: pageParam, q: qParam, sortBy: sortByParam } = await searchParams;
  const page = Math.max(1, Math.floor(Number(pageParam)) || 1);
  const searchQuery = typeof qParam === "string" ? qParam.trim() : "";
  const sortBy = typeof sortByParam === "string" ? sortByParam : "score";

  const { rows, hasNext } = await fetchPage(page, searchQuery, sortBy);
  const hasPrev = page > 1;
  const rankOffset = (page - 1) * PAGE_SIZE;

  const pagerLinkStyle = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#171717",
    backgroundColor: "#ffffff",
    border: "1px solid #c7c7c7",
    borderRadius: "6px",
    padding: "8px 16px",
    textDecoration: "none",
  };
  const pagerDisabledStyle = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#b2b2b2",
    backgroundColor: "#ffffff",
    border: "1px solid #ededed",
    borderRadius: "6px",
    padding: "8px 16px",
  };


  return (
    <>
      <Navbar />
      <main style={{ backgroundColor: "var(--color-canvas)", color: "var(--color-ink)", minHeight: "100vh", transition: "background-color 0.2s ease, color 0.2s ease" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "56px 20px" }}>
          {/* Header */}
          <header style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 600,
                color: "var(--color-ink)",
                letterSpacing: "-0.42px",
                margin: 0,
              }}
            >
              Explore Contributors
            </h1>
            <p style={{ fontSize: "15px", color: "var(--color-ink-mute)", margin: "8px 0 0 0" }}>
              The top open-source contributors on OSSfolio, ranked by contribution score.
            </p>
          </header>

          {/* Search and Sort controls */}
          <form method="GET" action="/explore" style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by username or name..."
              style={{
                flex: "1",
                minWidth: "200px",
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid var(--color-hairline)",
                borderRadius: "6px",
                backgroundColor: "var(--color-canvas)",
                color: "var(--color-ink)",
                outline: "none",
              }}
            />
            <select
              name="sortBy"
              defaultValue={sortBy}
              style={{
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid var(--color-hairline)",
                borderRadius: "6px",
                backgroundColor: "var(--color-canvas)",
                color: "var(--color-ink)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="score">Sort by Score</option>
              <option value="prs">Sort by PRs</option>
              <option value="commits">Sort by Commits</option>
              <option value="issues">Sort by Issues</option>
            </select>
            <button
              type="submit"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-on-primary)",
                border: "none",
                borderRadius: "6px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </form>

          {rows.length === 0 ? (
            <div
              style={{
                border: "1px solid var(--color-hairline)",
                borderRadius: "12px",
                padding: "48px 24px",
                textAlign: "center",
                backgroundColor: "var(--color-canvas-soft)",
              }}
            >
              <p style={{ fontSize: "15px", fontWeight: 500, color: "var(--color-ink)", margin: 0 }}>
                {page > 1 ? "Nothing more to show" : "No contributors found"}
              </p>
              <p style={{ fontSize: "14px", color: "var(--color-ink-mute)", margin: "6px 0 0 0" }}>
                {page > 1
                  ? "You have reached the end of the leaderboard."
                  : "Try clearing your search filters to find contributors."}
              </p>
              {page > 1 && (
                <p style={{ margin: "16px 0 0 0" }}>
                  <Link href={`/explore?q=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`} style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-ink)", textDecoration: "underline" }}>
                    Back to page 1
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <ol
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                margin: 0,
                padding: 0,
              }}
            >
              {rows.map((row, index) => {
                const rank = rankOffset + index + 1;
                const displayName = row.name || row.username;
                const avatar =
                  row.avatar_url &&
                  (row.avatar_url.startsWith("https://avatars.githubusercontent.com/") ||
                    row.avatar_url.startsWith("https://github.com/"))
                    ? row.avatar_url
                    : `https://github.com/${encodeURIComponent(row.username)}.png`;
                const score = typeof row.score === "number" ? row.score : 0;
                const prs = row.total_prs || 0;
                const issues = row.total_issues || 0;
                const commits = row.total_commits || 0;
                const isTop = rank <= 3;

                return (
                  <li key={row.username}>
                    <Link
                      href={`/${encodeURIComponent(row.username)}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 18px",
                        border: "1px solid var(--color-hairline)",
                        borderRadius: "12px",
                        textDecoration: "none",
                        backgroundColor: "var(--color-canvas-soft)",
                        transition: "border-color 0.2s ease, transform 0.2s ease",
                      }}
                    >
                      {/* Rank */}
                      <span
                        style={{
                          minWidth: "32px",
                          fontSize: "16px",
                          fontWeight: 600,
                          color: isTop ? "var(--color-primary)" : "var(--color-ink-mute)",
                          textAlign: "center",
                          flexShrink: 0,
                        }}
                      >
                        {rank}
                      </span>

                      {/* Avatar */}
                      <Image
                        src={avatar}
                        alt={`${displayName} avatar`}
                        width={40}
                        height={40}
                        style={{
                          borderRadius: "9999px",
                          border: "1px solid var(--color-hairline)",
                          flexShrink: 0,
                        }}
                      />

                      {/* Identity + stats (stacked, so it never overflows on mobile) */}
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--color-ink)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayName}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--color-ink-mute)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          @{row.username}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--color-ink-mute-2)" }}>
                          {prs} PRs, {issues} issues, {commits} commits
                        </span>
                      </span>

                      {/* Score */}
                      <span
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          minWidth: "60px",
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-ink)", lineHeight: 1 }}>
                          {score}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--color-ink-mute)", marginTop: "3px" }}>
                          score
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}

          {/* Pagination */}
          {(hasPrev || hasNext) && (
            <nav
              style={{
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              {hasPrev ? (
                <Link href={`/explore?page=${page - 1}&q=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`} style={pagerLinkStyle}>
                  Previous
                </Link>
              ) : (
                <span style={pagerDisabledStyle} aria-disabled="true">
                  Previous
                </span>
              )}

              <span style={{ fontSize: "13px", color: "var(--color-ink-mute)" }}>Page {page}</span>

              {hasNext ? (
                <Link href={`/explore?page=${page + 1}&q=${encodeURIComponent(searchQuery)}&sortBy=${sortBy}`} style={pagerLinkStyle}>
                  Next
                </Link>
              ) : (
                <span style={pagerDisabledStyle} aria-disabled="true">
                  Next
                </span>
              )}
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

