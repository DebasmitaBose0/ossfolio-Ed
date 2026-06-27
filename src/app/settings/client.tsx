"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface CustomLink {
  label: string;
  url: string;
}

interface Badge {
  program: string;
  years: number[];
}

interface ProfileSettings {
  headline: string;
  pinned_repos: string[];
  custom_links: CustomLink[];
  badges: Badge[];
  visibility: "public" | "unlisted";
}

const AVAILABLE_BADGES = [
  "GSoC", "Hacktoberfest", "MLH Fellow", "GitHub Star",
  "Arctic Code Vault", "Mars 2020", "ELUSOC 2026",
];

export function SettingsClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<ProfileSettings>({
    headline: "",
    pinned_repos: [],
    custom_links: [],
    badges: [],
    visibility: "public",
  });

  const fetchSettings = async (token: string) => {
    try {
      const resp = await fetch("/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setSettings({
          headline: data.headline || "",
          pinned_repos: data.pinned_repos || [],
          custom_links: data.custom_links || [],
          badges: data.badges || [],
          visibility: data.visibility || "public",
        });
        setLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchSettings(s.access_token);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSave = useCallback(async () => {
    if (!session || !loaded) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    const payload = {
      ...settings,
      pinned_repos: settings.pinned_repos.filter(Boolean),
      custom_links: settings.custom_links.filter((l) => l.label || l.url),
    };
    try {
      const resp = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });
      if (resp.ok) setSaved(true);
      else setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [session, settings, loaded]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (loading) {
    return <p style={{ color: "#9a9a9a", fontSize: "14px" }}>Loading...</p>;
  }

  if (!session) {
    return (
      <div style={{ border: "1px solid #ededed", borderRadius: "12px", padding: "48px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "15px", fontWeight: 500, color: "#171717", margin: "0 0 16px 0" }}>
          Sign in to customize your profile
        </p>
        <button
          onClick={handleLogin}
          style={{
            fontSize: "14px", fontWeight: 500, color: "#ffffff",
            backgroundColor: "#171717", border: "none", borderRadius: "6px",
            padding: "10px 20px", cursor: "pointer",
          }}
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", fontSize: "15px", padding: "10px 14px",
    border: "1px solid #ededed", borderRadius: "6px", backgroundColor: "#fafafa", color: "#171717",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "14px", fontWeight: 500, color: "#171717", display: "block", marginBottom: "6px",
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: "32px", paddingBottom: "32px", borderBottom: "1px solid #ededed",
  };

  return (
    <div>
      <div style={sectionStyle}>
        <label style={labelStyle}>Custom Headline</label>
        <input
          type="text"
          placeholder="Your custom tagline (replaces GitHub bio)"
          value={settings.headline}
          onChange={(e) => setSettings((s) => ({ ...s, headline: e.target.value }))}
          maxLength={160}
          style={inputStyle}
          aria-label="Custom headline"
        />
        <p style={{ fontSize: "12px", color: "#9a9a9a", marginTop: "4px" }}>
          {settings.headline.length}/160 characters
        </p>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Pinned Repositories (up to 6)</label>
        <p style={{ fontSize: "13px", color: "#707070", margin: "0 0 8px 0" }}>
          Enter repo names (e.g. &quot;my-project&quot;) to pin on your profile.
        </p>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Repo ${i + 1}`}
            value={settings.pinned_repos[i] || ""}
            onChange={(e) => {
              setSettings((s) => {
                const repos = [...s.pinned_repos];
                repos[i] = e.target.value;
                return { ...s, pinned_repos: repos };
              });
            }}
            style={{ ...inputStyle, marginBottom: "8px" }}
            aria-label={`Pinned repo ${i + 1}`}
          />
        ))}
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Badges</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {AVAILABLE_BADGES.map((badge) => {
            const isSelected = settings.badges.some((b) => b.program === badge);
            return (
              <button
                key={badge}
                type="button"
                onClick={() => {
                  setSettings((s) => ({
                    ...s,
                    badges: isSelected
                      ? s.badges.filter((b) => b.program !== badge)
                      : [...s.badges, { program: badge, years: [new Date().getFullYear()] }],
                  }));
                }}
                style={{
                  fontSize: "13px", padding: "6px 12px", borderRadius: "6px", cursor: "pointer",
                  border: isSelected ? "1px solid #24b47e" : "1px solid #ededed",
                  backgroundColor: isSelected ? "#e6f9f1" : "#ffffff",
                  color: isSelected ? "#24b47e" : "#707070", fontWeight: 500,
                }}
                aria-pressed={isSelected}
              >
                {badge}
              </button>
            );
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Custom Links (up to 5)</label>
        {Array.from({ length: Math.min(5, (settings.custom_links.length || 0) + 1) }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="Label"
              value={settings.custom_links[i]?.label || ""}
              onChange={(e) => {
                setSettings((s) => {
                  const links = [...s.custom_links];
                  links[i] = { label: e.target.value, url: links[i]?.url || "" };
                  return { ...s, custom_links: links };
                });
              }}
              style={{ ...inputStyle, flex: 1 }}
              aria-label={`Link ${i + 1} label`}
            />
            <input
              type="url"
              placeholder="https://..."
              value={settings.custom_links[i]?.url || ""}
              onChange={(e) => {
                setSettings((s) => {
                  const links = [...s.custom_links];
                  links[i] = { label: links[i]?.label || "", url: e.target.value };
                  return { ...s, custom_links: links };
                });
              }}
              style={{ ...inputStyle, flex: 2 }}
              aria-label={`Link ${i + 1} URL`}
            />
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "32px" }}>
        <label style={labelStyle}>Profile Visibility</label>
        <select
          value={settings.visibility}
          onChange={(e) => setSettings((s) => ({ ...s, visibility: e.target.value as "public" | "unlisted" }))}
          style={{ ...inputStyle, width: "auto", cursor: "pointer" }}
          aria-label="Profile visibility"
        >
          <option value="public">Public (visible on Discover)</option>
          <option value="unlisted">Unlisted (only accessible via direct link)</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !loaded}
        style={{
          fontSize: "14px", fontWeight: 500, color: "#ffffff",
          backgroundColor: "#24b47e", border: "none", borderRadius: "6px",
          padding: "12px 24px", cursor: saving ? "wait" : "pointer",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
      {saved && (
        <span style={{ fontSize: "13px", color: "#24b47e", marginLeft: "12px" }}>
          Saved successfully!
        </span>
      )}
      {saveError && (
        <span style={{ fontSize: "13px", color: "#b91c1c", marginLeft: "12px" }}>
          {saveError}
        </span>
      )}
    </div>
  );
}
