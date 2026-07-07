import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },

  serverExternalPackages: [],
};

// Build-time environment validation
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function validateEnv() {
  const missing: string[] = [];
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    console.warn(
      `\n⚠️  Missing required environment variables:\n   ${missing.join(", ")}\n` +
      "   Copy .env.example to .env.local and fill in the values.\n" +
      "   See CONTRIBUTING.md for setup instructions.\n"
    );
  }
}

validateEnv();

export default nextConfig;
