"use client";

import { useCallback } from "react";

export function SkipToContent() {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.left = "0";
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.left = "-9999px";
  }, []);

  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        zIndex: 9999,
        padding: "12px 20px",
        backgroundColor: "#3ecf8e",
        color: "#171717",
        fontSize: "14px",
        fontWeight: 600,
        textDecoration: "none",
        borderRadius: "0 0 8px 0",
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      Skip to main content
    </a>
  );
}
