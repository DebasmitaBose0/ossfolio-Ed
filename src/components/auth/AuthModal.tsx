"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ open, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "read:user user:email public_repo read:org",
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setError("Check your email to confirm your account.");
        setLoading(false);
      }
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #dfdfdf",
    borderRadius: "6px",
    fontSize: "14px",
    color: "#171717",
    outline: "none",
    backgroundColor: "#ffffff",
    boxSizing: "border-box" as const,
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-md"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #ededed",
          boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
          padding: "40px",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9a9a9a",
            padding: "4px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#171717")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9a9a9a")}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#171717", letterSpacing: "-0.3px", margin: 0 }}>
            {mode === "signin" ? "Welcome back" : "Create your profile"}
          </h2>
          <p style={{ marginTop: "6px", fontSize: "14px", color: "#707070", margin: "6px 0 0 0" }}>
            {mode === "signin"
              ? "Sign in to access your OSSfolio profile."
              : "Sign up and showcase your open-source journey."}
          </p>
        </div>

        {/* GitHub OAuth */}
        <button
          onClick={handleGitHubSignIn}
          disabled={loading}
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "11px 16px",
            border: "1px solid #dfdfdf",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#171717",
            backgroundColor: "#ffffff",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#fafafa"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#ffffff"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          {loading ? "Redirecting…" : "Continue with GitHub"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#ededed" }} />
          <span style={{ fontSize: "12px", color: "#9a9a9a" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#ededed" }} />
        </div>

        {/* Error / info message */}
        {error && (
          <p style={{
            marginBottom: "16px",
            fontSize: "13px",
            color: error.startsWith("Check") ? "#24b47e" : "#e2005a",
            backgroundColor: error.startsWith("Check") ? "#f0fdf8" : "#fff1f4",
            padding: "10px 14px",
            borderRadius: "6px",
            border: `1px solid ${error.startsWith("Check") ? "#bbf7e0" : "#fecdd9"}`,
          }}>
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "signup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#171717" }}>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3ecf8e")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#dfdfdf")}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#171717" }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3ecf8e")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#dfdfdf")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#171717" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3ecf8e")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#dfdfdf")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "4px",
              width: "100%",
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: "#3ecf8e",
              color: "#171717",
              padding: "11px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#24b47e"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#3ecf8e"; }}
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#707070" }}>
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            style={{ fontSize: "13px", fontWeight: 500, color: "#171717", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
