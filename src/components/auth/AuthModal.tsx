"use client";

import { useEffect, useRef, useState } from "react";
import { X,Eye,EyeOff } from "lucide-react";
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
const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !overlayRef.current) return;
      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [open]);

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

    // Form inputs client side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        onClose();
      }
    } else {
      if (!name.trim()) {
        setError("Please enter your full name.");
        setLoading(false);
        return;
      }
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
    border: "1px solid var(--color-hairline)",
    borderRadius: "6px",
    fontSize: "14px",
    color: "var(--color-ink)",
    outline: "none",
    backgroundColor: "var(--color-canvas)",
    boxSizing: "border-box" as const,
    transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
  };

  const isSuccessMessage = error.startsWith("Check");

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "signin" ? "Sign in to OSSfolio" : "Create your OSSfolio profile"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-md"
        style={{
          backgroundColor: "var(--color-canvas)",
          borderRadius: "12px",
          border: "1px solid var(--color-hairline-strong)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)",
          padding: "40px",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close sign in dialog"
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-ink-mute-2)",
            padding: "4px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-ink-mute-2)")}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--color-ink)", letterSpacing: "-0.3px", margin: 0, transition: "color 0.2s ease" }}>
            {mode === "signin" ? "Welcome back" : "Create your profile"}
          </h2>
          <p style={{ marginTop: "6px", fontSize: "14px", color: "var(--color-ink-mute)", margin: "6px 0 0 0", transition: "color 0.2s ease" }}>
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
            border: "1px solid var(--color-hairline)",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--color-ink)",
            backgroundColor: "var(--color-canvas)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "var(--color-canvas-soft)"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "var(--color-canvas)"; }}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
</svg>

          {loading ? "Redirecting…" : "Continue with GitHub"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-hairline-cool)" }} />
          <span style={{ fontSize: "12px", color: "var(--color-ink-mute-2)" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-hairline-cool)" }} />
        </div>

        {/* Error / info message */}
        {error && (
          <p style={{
            marginBottom: "16px",
            fontSize: "13px",
            color: isSuccessMessage ? "var(--color-primary)" : "#ff4d88",
            backgroundColor: isSuccessMessage ? "var(--color-primary-soft)" : "rgba(255, 77, 136, 0.1)",
            padding: "10px 14px",
            borderRadius: "6px",
            border: `1px solid ${isSuccessMessage ? "var(--color-primary)" : "rgba(255, 77, 136, 0.2)"}`,
          }}>
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "signup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-ink)", transition: "color 0.2s ease" }}>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-hairline)")}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-ink)", transition: "color 0.2s ease" }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-hairline)")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
  <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-ink)", transition: "color 0.2s ease" }}>Password</label>
  
  {/* Relative wrapper context forces children layers to calculate positions relative to this box */}
  <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
    <input
      type={showPassword ? "text" : "password"}
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      
      style={{ ...inputStyle, paddingRight: "40px" }} 
      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-hairline)")}
    />
    
    {/* Absolute button layer overlays directly on top of the input canvas */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: "absolute",
        right: "12px", // Pushes the eye inside the right border line
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--color-ink-mute-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
        height: "100%", // Matches the height context to stay perfectly centered vertically
      }}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
</div>


          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "4px",
              width: "100%",
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: "var(--color-primary)",
              color: "var(--color-on-primary)",
              padding: "11px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "var(--color-primary-deep)"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "var(--color-primary)"; }}
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--color-ink-mute)", transition: "color 0.2s ease" }}>
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-ink)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-ink)")}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}