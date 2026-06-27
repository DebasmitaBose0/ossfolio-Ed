"use client";

import Link from "next/link";
import Image from "next/image";

interface ProfileCardProps {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  score: number;
  totalPrs: number;
  totalCommits: number;
  totalIssues: number;
  followers: number;
  topLanguages: string[];
}

export function ProfileCard({
  username,
  name,
  avatarUrl,
  bio,
  score,
  totalPrs,
  totalCommits,
  totalIssues,
  followers,
  topLanguages,
}: ProfileCardProps) {
  const displayName = name || username;
  const avatar =
    avatarUrl &&
    (avatarUrl.startsWith("https://avatars.githubusercontent.com/") ||
      avatarUrl.startsWith("https://github.com/"))
      ? avatarUrl
      : `https://github.com/${encodeURIComponent(username)}.png`;

  return (
    <Link
      href={`/${encodeURIComponent(username)}`}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        border: "1px solid #ededed",
        borderRadius: "12px",
        textDecoration: "none",
        backgroundColor: "#ffffff",
        transition: "border-color 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
        <Image
          src={avatar}
          alt={`${displayName} avatar`}
          width={44}
          height={44}
          style={{ borderRadius: "9999px", border: "1px solid #ededed", flexShrink: 0 }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#171717",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "#9a9a9a",
              margin: "2px 0 0 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            @{username}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: "20px", fontWeight: 600, color: "#171717", margin: 0, lineHeight: 1 }}>
            {score}
          </p>
          <p style={{ fontSize: "11px", color: "#9a9a9a", margin: "2px 0 0 0" }}>score</p>
        </div>
      </div>

      {bio && (
        <p
          style={{
            fontSize: "13px",
            color: "#707070",
            margin: "0 0 12px 0",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {bio}
        </p>
      )}

      {topLanguages.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
          {topLanguages.slice(0, 4).map((lang) => (
            <span
              key={lang}
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#4a4a4a",
                backgroundColor: "#fafafa",
                borderRadius: "4px",
                padding: "2px 8px",
              }}
            >
              {lang}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#9a9a9a" }}>
        <span>{totalPrs} PRs</span>
        <span>{totalCommits} commits</span>
        <span>{totalIssues} issues</span>
        <span>{followers} followers</span>
      </div>
    </Link>
  );
}
