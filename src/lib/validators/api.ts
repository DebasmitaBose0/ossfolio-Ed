import { NextResponse } from "next/server";

export function sanitizeUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().toLowerCase();
  if (cleaned.length > 39) return null;
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(cleaned)) return null;
  if (/^[-]|[-]$/.test(cleaned)) return null;
  return cleaned;
}

export function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, 2048);
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function validateYear(value: unknown): number | null {
  if (typeof value !== "string") return null;
  if (!/^\d{4}$/.test(value)) return null;
  const parsed = parseInt(value, 10);
  const now = new Date().getFullYear();
  if (parsed < now - 10 || parsed > now) return null;
  return parsed;
}

export function validatePagination(
  page: unknown,
  pageSize: unknown,
  maxPage = 100,
  maxSize = 100
): { page: number; pageSize: number } {
  const p = typeof page === "string" ? parseInt(page, 10) : typeof page === "number" ? page : 1;
  const s = typeof pageSize === "string" ? parseInt(pageSize, 10) : typeof pageSize === "number" ? pageSize : 20;
  return {
    page: Math.max(1, Math.min(maxPage, isNaN(p) ? 1 : p)),
    pageSize: Math.max(1, Math.min(maxSize, isNaN(s) ? 20 : s)),
  };
}

export function validateSortBy<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  if (typeof value !== "string") return fallback;
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function createApiResponse<T>(data: T, status = 200, extraHeaders?: Record<string, string>): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...extraHeaders,
    },
  });
}

export function createErrorResponse(
  error: string,
  status = 400,
  extra?: Record<string, unknown>,
  // Optional extra response headers. Added so a 429 can carry the standard `Retry-After`
  // header, which well-behaved clients, crawlers and proxies honour without needing to
  // parse the body. Existing callers are unaffected.
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { error, ...extra },
    {
      status,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        ...headers,
      },
    }
  );
}


