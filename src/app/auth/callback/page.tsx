"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const username = session?.user?.user_metadata?.user_name;
      if (username) {
        router.replace(`/${username}`);
      } else {
        router.replace("/");
      }
    });
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      <p style={{ color: "#707070", fontSize: "14px" }}>Signing you in…</p>
    </div>
  );
}
