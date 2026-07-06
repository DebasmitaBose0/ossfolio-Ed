"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/env";

export function EnvCheckBanner() {
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setTimeout(() => {
        setConfigured(false);
      }, 0);
    }
  }, []);

  if (configured) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(255, 183, 77, 0.15)",
        borderBottom: "1px solid rgba(255, 183, 77, 0.3)",
        padding: "10px 20px",
        textAlign: "center",
        fontSize: "13px",
        color: "var(--color-ink)",
      }}
    >
      ⚠️ Supabase is not configured.{" "}
      <a
        href="https://github.com/PRODHOSH/ossfolio/blob/main/CONTRIBUTING.md#local-setup"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--color-primary)", fontWeight: 500, textDecoration: "underline" }}
      >
        Set up your environment
      </a>{" "}
      to enable profile features.
    </div>
  );
}
