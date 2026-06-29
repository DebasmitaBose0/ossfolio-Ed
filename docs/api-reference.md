# API Reference

OSSfolio exposes several internal API routes used by the frontend. These are all defined under `src/app/api/`.

## Authentication

All authenticated endpoints require a Supabase access token in the `Authorization` header:

```
Authorization: Bearer <supabase-access-token>
```

---

## `GET /api/settings`

Fetch the current user's profile settings.

**Auth required**: Yes  
**Response**:
```json
{
  "headline": "string | null",
  "pinned_repos": "string[]",
  "custom_links": "{ label: string, url: string }[]",
  "badges": "{ program: string, years: number[] }[]",
  "visibility": "public | unlisted"
}
```

---

## `PUT /api/settings`

Update the current user's profile settings.

**Auth required**: Yes  
**Body**:
```json
{
  "headline": "string (max 160 chars)",
  "pinned_repos": "string[] (max 6)",
  "custom_links": "{ label: string, url: string }[] (max 5)",
  "badges": "{ program: string, years: number[] }[] (max 10)",
  "visibility": "public | unlisted"
}
```

**Response**: `{ "success": true }`

---

## `GET /api/discover?q=&lang=&sort=&min_score=&page=`

Search and paginate contributor profiles.

**Auth required**: No  
**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | "" | Full-text search query |
| `lang` | string | "" | Filter by top language |
| `sort` | "score" \| "contributions" \| "followers" | "score" | Sort order |
| `min_score` | number | 0 | Minimum score filter |
| `page` | number | 1 | Page number (max 50) |

**Response**:
```json
{
  "profiles": [{
    "username": "string",
    "name": "string | null",
    "avatar_url": "string | null",
    "bio": "string | null",
    "score": "number",
    "total_prs": "number",
    "total_commits": "number",
    "total_issues": "number",
    "followers": "number",
    "top_languages": "string[]"
  }],
  "page": "number",
  "hasNext": "boolean",
  "hasPrev": "boolean"
}
```

---

## `POST /api/[username]/refresh`

Trigger a profile data refresh. Rate-limited to once per 10 minutes.

**Auth required**: No (server-side validation only)  
**Response**:
```json
{
  "success": true,
  "message": "Profile <username> refresh triggered",
  "refreshedAt": "ISO 8601 timestamp"
}
```

**Rate limit response** (429):
```json
{
  "error": "Rate limited. Try again later.",
  "retryAfterSeconds": "number"
}
```

---

## `GET /api/[username]/contributions?year=`

Fetch yearly contribution calendar data for a user.

**Auth required**: No  
**Query params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `year` | number | current year | Year to fetch (within last 10 years) |

**Response**: Contribution calendar object with `weeks` and `totalContributions`.

Cache: `public, s-maxage=3600, stale-while-revalidate=600`

---

## `GET /api/discover?q=&lang=&sort=&min_score=&page=`

Search profiles with full-text search, language filter, and pagination.

**Auth required**: No  
**Response**: Paginated list of matching profiles.

---

## Error Responses

All API routes return consistent error shapes:

```json
{
  "error": "Human-readable error message"
}
```

Status codes:
- `400` — Invalid input / validation failure
- `401` — Missing or invalid authentication
- `404` — Resource not found
- `429` — Rate limited
- `500` — Internal server error
- `502` — Upstream service failure (e.g., GitHub API)

## Security Headers

All API responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
