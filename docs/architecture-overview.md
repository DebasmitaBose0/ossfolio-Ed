# Architecture Overview

## System Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│   Browser   │────▶│  Cloudflare  │────▶│  Next.js  │
│ (Next.js)   │     │  Pages (CDN) │     │  (Edge)   │
└─────────────┘     └──────────────┘     └─────┬─────┘
                                               │
                    ┌──────────────────────────┼──────────┐
                    │                          │          │
                    ▼                          ▼          ▼
             ┌───────────┐           ┌────────────┐  ┌────────┐
             │  Supabase │           │  GitHub    │  │ Redis  │
             │(Postgres) │           │  GraphQL   │  │ (KV)   │
             └───────────┘           │  REST API  │  └────────┘
                                     └────────────┘
```

## Key Design Decisions

### 1. Edge Runtime
All API routes use `export const runtime = "edge"` to leverage Cloudflare Pages Edge Functions for low-latency global responses.

### 2. Inline Styles over Tailwind
The profile components use inline `style` objects with CSS custom properties instead of Tailwind classes. This ensures consistent theming through CSS variables defined in `globals.css`.

### 3. Server Components + Client Islands
- **Server components**: Main content pages (explore, compare) fetch data at request time
- **Client components**: Interactive islands (share buttons, badge modal, heatmap) are wrapped in `"use client"`
- This hybrid approach maximizes initial load speed while keeping interactivity

### 4. Data Flow

```
GitHub User Request
       │
       ▼
[username]/page.tsx (Server Component)
       │
       ├── fetchGitHubUser()      ──▶ GitHub REST API
       ├── fetchGitHubRepos()     ──▶ GitHub REST API
       ├── fetchLiveStats()       ──▶ GitHub GraphQL
       ├── fetchOrganizations()   ──▶ GitHub REST API
       ├── fetchContributionCalendar() ──▶ GitHub HTML scrape
       └── supabase query         ──▶ Stored score fallback
       │
       ▼
ProfileView (Client Component)
       │
       ├── ProfileShareButtons
       ├── ProfileReposSection
       ├── ProfileDownloadCard
       ├── ProfileBadgeModal
       ├── HeatmapWithYearNav
       └── LatestMergedPRs
```

### 5. CSS Theming System

| Variable | Light | Dark |
|----------|-------|------|
| `--color-canvas` | `#ffffff` | `#1c1c1c` |
| `--color-ink` | `#171717` | `#ffffff` |
| `--color-ink-mute` | `#707070` | `#a3a3a3` |
| `--color-hairline` | `#dfdfdf` | `#2e2e2e` |
| `--color-primary` | `#3ecf8e` | `#3ecf8e` |

The `.dark` class on `<html>` triggers a full variable swap via the `:root.dark` selector block.

### 6. Database

- **Supabase (PostgreSQL)** with Row-Level Security
- Profiles auto-created via `handle_new_user()` trigger on auth sign-up
- Full-text search via `search_profiles()` RPC function with tsvector indexes
- Edge Functions for async profile refresh and scheduled batch updates

### 7. Score Calculation

```
Score = (commits × 1) + (PRs × 3) + (issues × 2) + (reviews × 2) + (min(stars, 1000) × 0.1)
```

See `src/lib/score.ts` for implementation and `/score-explained` for interactive calculator.
