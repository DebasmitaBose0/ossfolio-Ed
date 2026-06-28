import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const RATE_LIMIT_MS = 10 * 60 * 1000;
const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!username || username.length > 39 || !GITHUB_USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { error: "Invalid username" },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const cutoff = new Date(Date.now() - RATE_LIMIT_MS).toISOString();

  const { data, error, count } = await supabase
    .from("profiles")
    .update({
      last_refreshed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("username", username)
    .or(`last_refreshed_at.is.null,last_refreshed_at.lt.${cutoff}`)
    .select("username")
    .single();

  if (error && error.code === "PGRST116") {
    const { data: exists } = await supabase
      .from("profiles")
      .select("username, last_refreshed_at")
      .eq("username", username)
      .single();

    if (!exists) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const lastRefresh = exists.last_refreshed_at
      ? new Date(exists.last_refreshed_at).getTime()
      : 0;
    const retryAfter = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastRefresh)) / 1000);
    return NextResponse.json(
      { error: "Rate limited. Try again later.", retryAfterSeconds: Math.max(retryAfter, 1) },
      { status: 429 }
    );
  }

  if (error) {
    return NextResponse.json(
      { error: "Failed to refresh profile" },
      { status: 500 }
    );
  }

  revalidatePath(`/${username}`);

  return NextResponse.json({
    success: true,
    message: `Profile ${username} refresh triggered`,
    refreshedAt: new Date().toISOString(),
  });
}
