import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GITHUB_API = "https://api.github.com";
const BATCH_SIZE = 50;

serve(async (req) => {
  const schedulerSecret = Deno.env.get("SCHEDULER_SECRET");
  if (schedulerSecret) {
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader !== `Bearer ${schedulerSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("username")
      .order("view_count", { ascending: false })
      .limit(BATCH_SIZE);

    if (error || !profiles) {
      return new Response(
        JSON.stringify({ error: error?.message || "No profiles found" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const results: { username: string; status: string }[] = [];

    for (const profile of profiles) {
      try {
        const ghRes = await fetch(`${GITHUB_API}/users/${encodeURIComponent(profile.username)}`, {
          headers: { Accept: "application/vnd.github.v3+json" },
        });

        if (!ghRes.ok) {
          results.push({ username: profile.username, status: `github_error_${ghRes.status}` });
          continue;
        }

        const ghUser = await ghRes.json();

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            name: ghUser.name,
            avatar_url: ghUser.avatar_url,
            bio: ghUser.bio,
            followers: ghUser.followers,
            last_refreshed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("username", profile.username);

        if (updateError) {
          results.push({ username: profile.username, status: "db_write_failed" });
        } else {
          results.push({ username: profile.username, status: "refreshed" });
        }
      } catch {
        results.push({ username: profile.username, status: "error" });
      }
    }

    return new Response(
      JSON.stringify({ refreshed: results.filter((r) => r.status === "refreshed").length, total: profiles.length, results }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
