import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function warningMissingEnv() {
  if (typeof window !== "undefined" && !isSupabaseConfigured()) {
    console.warn(
      "[OSSfolio] Supabase is not configured. " +
      "Copy .env.example to .env.local and fill in your Supabase project details. " +
      "See CONTRIBUTING.md for setup instructions."
    );
  }
}

let client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!client) {
    warningMissingEnv();
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export const supabase = getSupabase();

export function supabaseAdmin() {
  warningMissingEnv();
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY ?? "");
}
