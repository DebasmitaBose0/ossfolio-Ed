"use client";

import { useEffect, useState } from "react";

interface SearchAccessibilityAnnouncerProps {
  resultsCount: number;
  isLoading: boolean;
}

export function SearchAccessibilityAnnouncer({
  resultsCount,
  isLoading,
}: SearchAccessibilityAnnouncerProps) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (isLoading) {
      setAnnouncement("Searching profiles, please wait...");
    } else {
      setAnnouncement(`Search completed. Found ${resultsCount} matching profile${resultsCount === 1 ? "" : "s"}.`);
    }
  }, [resultsCount, isLoading]);

  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcement}
    </div>
  );
}
