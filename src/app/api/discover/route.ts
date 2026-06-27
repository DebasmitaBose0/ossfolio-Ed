import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

const PAGE_SIZE = 20;
const MAX_PAGE = 50;
const VALID_SORT = ["score", "contributions", "followers"] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = (searchParams.get("q") || "").trim().slice(0, 100);
  const lang = (searchParams.get("lang") || "").trim();
  const minScore = Math.min(2147483647, Math.max(0, parseInt(searchParams.get("min_score") || "0", 10) || 0));
  const sortBy = VALID_SORT.includes(searchParams.get("sort") as typeof VALID_SORT[number])
    ? searchParams.get("sort")!
    : "score";
  const page = Math.min(MAX_PAGE, Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1));
  const offset = (page - 1) * PAGE_SIZE;

  try {
    const { data, error } = await supabase.rpc("search_profiles", {
      query,
      lang,
      min_score: minScore,
      sort_by: sortBy,
      page_size: PAGE_SIZE + 1,
      page_offset: offset,
    });

    if (error) {
      console.error("[discover] search_profiles RPC error:", error);
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }

    const results = (data || []) as Array<{
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
    }>;

    const hasNext = page < MAX_PAGE && results.length > PAGE_SIZE;
    const profiles = results.slice(0, PAGE_SIZE);

    return NextResponse.json({
      profiles,
      page,
      hasNext,
      hasPrev: page > 1,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
