import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GITHUB_API = "https://api.github.com";

serve(async (req) => {
  try {
    const { username } = await req.json();
    if (!username) {
      return new Response(JSON.stringify({ error: "username is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const ghRes = await fetch(`${GITHUB_API}/users/${username}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });

    if (!ghRes.ok) {
      return new Response(
        JSON.stringify({ error: `GitHub API returned ${ghRes.status}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const ghUser = await ghRes.json();

    const { error } = await supabase
      .from("profiles")
      .update({
        name: ghUser.name,
        avatar_url: ghUser.avatar_url,
        bio: ghUser.bio,
        followers: ghUser.followers,
        last_refreshed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("username", username);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, username, refreshedAt: new Date().toISOString() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
