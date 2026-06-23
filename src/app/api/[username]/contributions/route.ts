import { NextRequest, NextResponse } from "next/server";
import { fetchContributionCalendar } from "@/lib/github";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const year = request.nextUrl.searchParams.get("year");

  const from = year ? `${year}-01-01` : undefined;
  const calendar = await fetchContributionCalendar(username, from);

  if (!calendar) {
    return NextResponse.json(
      { error: "Failed to fetch contribution data" },
      { status: 502 }
    );
  }

  return NextResponse.json(calendar, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
  });
}
