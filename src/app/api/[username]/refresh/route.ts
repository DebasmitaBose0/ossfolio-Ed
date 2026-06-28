import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const RATE_LIMIT_MS = 10 * 60 * 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!username || username.length > 39) {
    return NextResponse.json(
      { error: "Invalid username" },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("username, last_refreshed_at")
    .eq("username", username)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );
  }

  const lastRefresh = profile.last_refreshed_at
    ? new Date(profile.last_refreshed_at).getTime()
    : 0;
  const now = Date.now();

  if (now - lastRefresh < RATE_LIMIT_MS) {
    const retryAfter = Math.ceil((RATE_LIMIT_MS - (now - lastRefresh)) / 1000);
    return NextResponse.json(
      { error: "Rate limited. Try again later.", retryAfterSeconds: retryAfter },
      { status: 429 }
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ last_refreshed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("username", username);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update refresh timestamp" },
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
