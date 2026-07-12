# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What this is

Naman Khandelwal's personal portfolio — a **single-page, terminal-themed site** built with **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**. Deployed on Vercel (region `bom1`) at **namankhandelwal.dev**. No backend, no database — content is static data plus a few live stat fetches during ISR.

> **Branching:** the live site is deployed from the **`dev`** branch, not `main`. Do work on `dev` (or a feature branch off it). `main` is stale/legacy (an older `client/` + `server/` React app).

## Commands

```bash
npm install
npm run dev        # next dev — http://localhost:3000
npm run build      # next build (runs TypeScript + generates static pages)
npm run start      # serve the production build
npm run lint       # eslint .
npm run typecheck  # tsc --noEmit
```

No test runner is configured. Verify changes with `npm run typecheck` and `npm run build`, then a manual run.

## Architecture

The whole page is one server component: [src/app/page.tsx](src/app/page.tsx) composes the sections in order (Hero → About → Experience → Stats → Projects → Hackathons → Skills → Blogs → Contact → Footer) and layers on interactive overlays (CommandPalette, ProjectModal, Snake, Matrix, Tweaks, GlobalEffects, CustomCursor). `export const revalidate = 3600` — the page is statically generated and re-fetched hourly (ISR).

- **`src/app/`** — App Router. [layout.tsx](src/app/layout.tsx) holds all SEO metadata (title, description, keywords, OG). [opengraph-image.tsx](src/app/opengraph-image.tsx), [sitemap.ts](src/app/sitemap.ts), [robots.ts](src/app/robots.ts) are generated routes.
- **`src/components/`** — one file per section/overlay. Sections that render content read from `src/lib/data.ts`. [Stats.tsx](src/components/Stats.tsx) is `async` and awaits `loadStats()`.
- **`src/lib/`** — all content + logic (see below).
- **`src/styles/globals.css`** — the entire design system (terminal aesthetic, one large file).
- **`public/assets/`** — resume PDF (`Naman_Khandelwal_Resume.pdf`) and logo.

## Where content lives — edit these, not the JSX

**[src/lib/data.ts](src/lib/data.ts) is the single source of truth for site content.** Exports typed arrays consumed by the section components:

- `PROJECTS` — each has `num`, `name`, `status` (`"live" | "wip" | "archive"`), `description`, `bullets[]`, `tags[]`, `links` (`{ live?, source }`), and a rich `deepDive` (tagline / problem / architecture / systemDesign[] / challenges[] / optional ASCII `diagram`). The `deepDive` is what renders in `ProjectModal`.
- `EXPERIENCES`, `SKILLS`, `ACHIEVEMENTS`, `NOTABLE_CONTRIBS`, `BLOGS`, `HACKATHONS`.
- Bullet/achievement strings contain inline HTML (`<strong>`, `<span class='acc'>`, `<a>`) and are rendered via `dangerouslySetInnerHTML` — keep markup valid and consistent with existing entries.

**[src/lib/site.ts](src/lib/site.ts)** — `SITE` constants: name, URLs, email, `github`/`githubHandle`, `cfHandle` (Codeforces), `linkedin`, `resumePath`. Change identity/handles here.

**⚠ The terminal has a parallel copy of the project data.** [src/lib/commands.tsx](src/lib/commands.tsx) (`PROJECTS` map + `PROJECT_ALIAS`) and [src/components/CommandPalette.tsx](src/components/CommandPalette.tsx) (the `ls` project table, the `open`/`view`/`whoami` command output, and the tab-complete name list) hardcode project names, statuses, and achievement lines **independently of `data.ts`**. When you add/remove/rename a project or change a headline stat (e.g. a Codeforces rank), grep the whole `src/` tree and update every occurrence — these files do not import from `data.ts`.

## Live stats (`src/lib/stats.ts`)

`loadStats()` is `server-only` and runs during build/ISR. It fetches (with a 12s timeout and graceful offline fallback):
- GitHub contribution heatmap, user profile, and recent merged PRs (via `SITE.githubHandle`).
- Codeforces submission heatmap + rating/rank (via `SITE.cfHandle`).

Failures degrade to `status: "offline"` — never throw. `Stats.tsx` also has **hardcoded fallback numbers** (Codeforces max rating/rank, LeetCode, CodeChef) shown when the live fetch is unavailable; keep these in sync with the résumé when they change.

## Environment variables

See [.env.example](.env.example). Both are optional:
- `NEXT_PUBLIC_SITE_URL` — public canonical URL for metadata/sitemap/OG.
- `GITHUB_TOKEN` — read-only (no scopes needed); only lifts the 60 req/hr unauthenticated limit during the build's stat fetch. The site builds fine without it.

## Conventions

- Path alias `@/*` → `src/*` ([tsconfig.json](tsconfig.json)).
- Security headers (CSP-adjacent: HSTS, X-Frame-Options, etc.) and long-cache for `/assets/*` are set in [next.config.ts](next.config.ts).
- Keep the terminal/hacker aesthetic: monospace, lowercase labels, `acc`/`hl`/`ok`/`warn`/`muted` span classes, ASCII framing. Match the tone of surrounding entries.
- Résumé is the source of truth for stats/achievements. When updating, sweep `data.ts`, `commands.tsx`, `CommandPalette.tsx`, `Stats.tsx`, `Hero.tsx`, `Sections.tsx`, and `layout.tsx` (SEO description/keywords) together.
