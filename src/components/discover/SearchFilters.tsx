"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "score", label: "Score" },
  { value: "contributions", label: "Contributions" },
  { value: "followers", label: "Followers" },
] as const;

const POPULAR_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "Ruby",
  "PHP",
  "Swift",
];

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [minScoreInput, setMinScoreInput] = useState(searchParams.get("min_score") || "");
  const queryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lang = searchParams.get("lang") || "";
  const sort = searchParams.get("sort") || "score";
  const minScore = searchParams.get("min_score") || "";

  const pushParams = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams();
      const merged = { q: query, lang, sort, min_score: minScore, ...overrides };
      Object.entries(merged).forEach(([key, val]) => {
        if (val) params.set(key, val);
      });
      router.replace(`/discover?${params.toString()}`);
    },
    [query, lang, sort, minScore, router]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
    queryDebounceRef.current = setTimeout(() => {
      pushParams({ q: value, page: "" });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (queryDebounceRef.current) clearTimeout(queryDebounceRef.current);
      if (scoreDebounceRef.current) clearTimeout(scoreDebounceRef.current);
    };
  }, []);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    fontSize: "15px",
    padding: "12px 16px",
    border: "1px solid #ededed",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "#fafafa",
    color: "#171717",
  };

  const selectStyle: React.CSSProperties = {
    fontSize: "14px",
    padding: "8px 12px",
    border: "1px solid #ededed",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#171717",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
      <input
        type="text"
        placeholder="Search by username, name, or language..."
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        style={inputStyle}
        aria-label="Search profiles"
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <select
          value={lang}
          onChange={(e) => {
            pushParams({ lang: e.target.value, page: "" });
          }}
          style={selectStyle}
          aria-label="Filter by language"
        >
          <option value="">All Languages</option>
          {POPULAR_LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            pushParams({ sort: e.target.value, page: "" });
          }}
          style={selectStyle}
          aria-label="Sort by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min score"
          value={minScoreInput}
          onChange={(e) => {
            setMinScoreInput(e.target.value);
            if (scoreDebounceRef.current) clearTimeout(scoreDebounceRef.current);
            scoreDebounceRef.current = setTimeout(() => {
              pushParams({ min_score: e.target.value, page: "" });
            }, 500);
          }}
          min={0}
          style={{ ...selectStyle, width: "100px" }}
          aria-label="Minimum score filter"
        />

        {(query || lang || minScore) && (
          <button
            onClick={() => {
              setQuery("");
              setMinScoreInput("");
              router.replace("/discover");
            }}
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#707070",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
