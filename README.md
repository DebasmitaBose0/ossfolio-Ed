<div align="center">

# OSSfolio

**Your open-source identity, beyond GitHub.**

[![CI](https://github.com/PRODHOSH/ossfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/PRODHOSH/ossfolio/actions/workflows/ci.yml)
[![CodeQL](https://github.com/PRODHOSH/ossfolio/actions/workflows/codeql.yml/badge.svg)](https://github.com/PRODHOSH/ossfolio/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![All Contributors](https://img.shields.io/github/all-contributors/PRODHOSH/ossfolio?color=ee8449)](https://github.com/PRODHOSH/ossfolio#contributors)

</div>

---

## What is OSSfolio?

GitHub shows your repos. OSSfolio shows **you**.

OSSfolio is a free, open-source platform where every contributor gets a public profile page at `ossfolio.me/username` — showcasing the full picture of their open-source journey. The PRs you merged into other projects, the issues you filed, the orgs you contributed to, the programs you participated in like GSoC or GSSoC — all in one shareable link.

No manual input. Just sign in with GitHub and your profile is ready.

---

## Why does this exist?

GitHub profiles are built around repositories — stars, forks, and commit graphs tell only part of the story.

If you've spent months reviewing PRs, triaging issues, contributing to other people's projects, or participating in GSoC/GSSoC — none of that shows up clearly on your GitHub profile. Recruiters miss it. Maintainers miss it. You can't share it.

OSSfolio is built to fix that — for students applying to GSoC, for developers sharing their work with recruiters, and for anyone who wants their contributions to actually be seen.

---

## Features

- **Shareable profile** at `ossfolio.me/username`
- **Contribution stats** — merged PRs, issues opened, commits, reviews
- **Heatmap & streak** — visualise your activity across the year
- **Tech stack** — auto-detected from your repos, no tagging needed
- **Organizations** — every org you've contributed to
- **GSoC / GSSoC badges** — show your program participation
- **Contributor score** — a single number summarising your impact
- **Leaderboard** — see how you rank against other contributors

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion |
| Backend | Supabase · PostgreSQL |
| Data | GitHub GraphQL API |
| Hosting | Vercel |

---

## Running it locally

**What you need before starting:**
- Node.js 20+
- A free [Supabase](https://supabase.com) account
- Git

**Steps:**

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/ossfolio.git
cd ossfolio

# 2. Install dependencies
npm install

# 3. Copy the environment variables file
cp .env.example .env.local
```

**Setting up the database (pick one):**

> **Option A — Supabase Dashboard** (recommended for most contributors, no extra tools needed)
> 1. Create a free project at [supabase.com](https://supabase.com)
> 2. Go to your project → **SQL Editor → New query**
> 3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) → paste → click **Run**
> 4. All tables and permissions are created instantly

> **Option B — Supabase CLI** (if you prefer local development with Docker)
> ```bash
> npm install -g supabase
> supabase start       # starts a local Supabase instance
> supabase db reset    # creates all tables + loads sample data
> ```

**Finishing up:**

Once Supabase is set up, copy your project URL and anon key into `.env.local` (you'll find them in your Supabase dashboard under **Project Settings → API**), then:

```bash
npm run dev
```

Open `http://localhost:3000` and you're in.

For a detailed walkthrough — environment variables, GitHub OAuth setup, database change guidelines — see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Want to contribute?

OSSfolio is built by contributors, for contributors. That's kind of the whole point.

**How to get started:**
1. Browse [open issues](https://github.com/PRODHOSH/ossfolio/issues) — filter by `good first issue` if it's your first time
2. Comment on the issue explaining your approach — in your own words, not AI-generated
3. Wait to be assigned, then start working and open a PR

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before you start. They're short, worth it.

---

## Contributors

Everyone who's helped build OSSfolio — code, design, docs, ideas, all of it.

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://prodhosh.me/"><img src="https://avatars.githubusercontent.com/u/213995806?v=4?s=100" width="100px;" alt="PRODHOSH V.S"/><br /><sub><b>PRODHOSH V.S</b></sub></a><br /><a href="https://github.com/PRODHOSH/ossfolio/commits?author=PRODHOSH" title="Code">💻</a> <a href="https://github.com/PRODHOSH/ossfolio/commits?author=PRODHOSH" title="Documentation">📖</a> <a href="#design-PRODHOSH" title="Design">🎨</a> <a href="https://github.com/PRODHOSH/ossfolio/issues?q=author%3APRODHOSH" title="Bug reports">🐛</a> <a href="https://github.com/PRODHOSH/ossfolio/pulls?q=is%3Apr+reviewed-by%3APRODHOSH" title="Reviewed Pull Requests">👀</a> <a href="#ideas-PRODHOSH" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-PRODHOSH" title="Maintenance">🚧</a> <a href="https://github.com/PRODHOSH/ossfolio/commits?author=PRODHOSH" title="Tests">⚠️</a> <a href="#infra-PRODHOSH" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/karishma9142"><img src="https://avatars.githubusercontent.com/u/193392138?v=4?s=100" width="100px;" alt="Karishma Kumari"/><br /><sub><b>Karishma Kumari</b></sub></a><br /><a href="https://github.com/PRODHOSH/ossfolio/commits?author=karishma9142" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## License

[MIT](LICENSE) — free to use, fork, and build on.
