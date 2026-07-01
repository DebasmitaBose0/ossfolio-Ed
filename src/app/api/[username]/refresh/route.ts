import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { sanitizeUsername, createApiResponse, createErrorResponse } from "@/lib/api-validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const RATE_LIMIT_MS = 10 * 60 * 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username: rawUsername } = await params;
  const username = sanitizeUsername(rawUsername);

  if (!username) {
    return createErrorResponse("Invalid GitHub username format", 400);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const cutoff = new Date(Date.now() - RATE_LIMIT_MS).toISOString();

  const { data, error } = await supabase
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
      return createErrorResponse("Profile not found", 404);
    }

    const lastRefresh = exists.last_refreshed_at
      ? new Date(exists.last_refreshed_at).getTime()
      : 0;
    const retryAfter = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastRefresh)) / 1000);
    return createErrorResponse("Rate limited. Try again later.", 429, {
      retryAfterSeconds: Math.max(retryAfter, 1),
    });
  }

  if (error) {
    return createErrorResponse("Failed to refresh profile", 500);
  }

  revalidatePath(`/${username}`);

  return createApiResponse({
    success: true,
    message: `Profile ${username} refresh triggered`,
    refreshedAt: new Date().toISOString(),
  });
}
