# Contributing to OSSfolio

Thank you for taking the time to contribute. OSSfolio is built entirely by contributors like you — every PR, issue, and discussion makes it better.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Local Setup](#local-setup)
  - [1. Fork and clone](#1-fork-and-clone)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Set up the database](#3-set-up-the-database)
  - [4. Environment variables](#4-environment-variables)
  - [5. Run the dev server](#5-run-the-dev-server)
- [Database — Making Schema Changes](#database--making-schema-changes)
- [Branch Naming](#branch-naming)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Good First Issues](#good-first-issues)
- [Questions](#questions)

---

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

---

## How Can I Contribute?

### Fix a bug
Open issues labelled [`bug`](../../issues?q=label%3Abug+is%3Aopen). Comment to claim one before starting.

### Build a feature
Open issues labelled [`enhancement`](../../issues?q=label%3Aenhancement+is%3Aopen). Comment explaining your approach and wait to be assigned.

### Improve docs
Typos, unclear sections, missing info — no issue needed for small doc fixes. Just open a PR.

### Report a bug
Open an issue using the **Bug Report** template. Include steps to reproduce, expected behaviour, and screenshots if relevant.

### Suggest a feature
Open an issue using the **Feature Request** template. Describe the problem it solves, not just what you want built.

---

## Local Setup

### 1. Fork and clone

Fork the repo on GitHub, then clone your fork:

```bash
git clone https://github.com/<your-username>/ossfolio.git
cd ossfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

OSSfolio uses [Supabase](https://supabase.com) (PostgreSQL) as its backend — it provides the database, authentication, and API. Pick whichever option works for you.

---

#### Option A — Supabase Dashboard (easiest, no extra tools)

This is the recommended path for most contributors.

1. Create a free project at [supabase.com](https://supabase.com)
2. In your project, go to **SQL Editor → New query**
3. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo
4. Copy the entire contents, paste into the editor, and click **Run**
5. All tables and row-level security policies are created — you're done

---

#### Option B — Supabase CLI (local Docker)

> **Note:** This option requires [Docker](https://www.docker.com) to be installed and running on your machine before you begin.

Use this if you want a fully local setup without a cloud Supabase project.

```bash
# Install the Supabase CLI
npm install -g supabase

# Start a local Supabase instance
supabase start

# Apply all migrations and load sample seed data
supabase db reset
```

`supabase db reset` runs every file inside `supabase/migrations/` in timestamp order, then runs `supabase/seed.sql` to load sample data. Your local database is fully ready.

The CLI will print your local project URL and anon key — use those in `.env.local`.

---

### 4. Environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → **Project API keys** → `anon` `public` (this is a safe, public key used to access Supabase from the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in your terminal |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |

GitHub OAuth is configured directly inside Supabase — go to **Authentication → Providers → GitHub** in your Supabase dashboard and enter your GitHub OAuth app credentials there. You do not need to add them to `.env.local`.

---

### 5. Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Database — Making Schema Changes

The database schema lives in two places that are always kept in sync:

| File | Purpose |
|---|---|
| `supabase/schema.sql` | Single master file — paste this into Supabase dashboard to set up everything at once |
| `supabase/migrations/` | Individual migration files — used by the Supabase CLI, one file per change |

### If your PR changes the database schema

**Do not edit existing migration files.** They are immutable once merged — changing them breaks other contributors' local setups.

Instead, create a new migration file:

```bash
supabase migration new describe_your_change
```

This creates `supabase/migrations/<timestamp>_describe_your_change.sql`. Write your SQL there.

Then update `supabase/schema.sql` to reflect the change so dashboard users stay in sync. Both files must be included in your PR.

Reviewers will check the SQL diff before merging.

---

## Branch Naming

Use the format `type/short-description`:

| Prefix | When to use |
|---|---|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `refactor/` | Code cleanup, no behaviour change |
| `chore/` | Tooling, CI, config |
| `test/` | Tests only |

Examples: `feat/contribution-heatmap`, `fix/github-api-rate-limit`, `docs/supabase-setup`

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short summary under 72 chars
```

Examples:
- `feat(profile): add merged PR count display`
- `fix(api): handle GitHub rate limit gracefully`
- `docs(contributing): clarify supabase setup options`
- `chore(db): add leaderboard migration`

---

## Pull Request Process

1. Make sure your branch is up to date with `main`
2. Fill out the PR template completely — incomplete PRs may be closed
3. Link the issue using `Closes #<issue-number>` in the PR description
4. One logical change per PR — don't bundle unrelated fixes
5. All PRs need at least one review before merge
6. A maintainer will merge once approved

### PR Checklist

- [ ] Code works locally
- [ ] No `console.log` left in `src/`
- [ ] If schema changed — both `schema.sql` and a new migration file are included
- [ ] Docs updated if needed
- [ ] PR title follows Conventional Commits format

---

## Issue Guidelines

- Search before opening — check if the issue already exists
- Use the correct template (Bug Report / Feature Request / Good First Issue / Docs)
- Be specific — vague issues are hard to act on
- If you want to fix an issue you opened, say so in the issue itself

---

## Good First Issues

New to open source? Start here:

- [`good first issue`](../../issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) — beginner-friendly tasks with clear scope
- [`documentation`](../../issues?q=is%3Aissue+is%3Aopen+label%3Adocumentation) — great entry point if you're not ready to touch code yet

Not sure where to start? Open a [Discussion](../../discussions) and ask — we'll help you find something.

---

## Questions?

Open a [Discussion](../../discussions) rather than an issue for general questions. Issues are for bugs and feature requests — discussions are for everything else.