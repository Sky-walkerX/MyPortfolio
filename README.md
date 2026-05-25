# nk-portfolio

Naman Khandelwal — terminal-themed portfolio. Built with **Next.js 16**, **React 19**, **TypeScript** and **Tailwind CSS v4**.

Live: [namankhandelwal.me](https://namankhandelwal.me)

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + Server Components
- TypeScript (strict)
- Tailwind CSS v4 (CSS-first config via `@theme`)
- Web Audio API · Canvas · IntersectionObserver
- Server-side ISR for live GitHub + Codeforces stats (1h revalidation)

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Script        | Purpose                                |
| ------------- | -------------------------------------- |
| `dev`         | Start the dev server                   |
| `build`       | Production build                       |
| `start`       | Run the production build               |
| `lint`        | ESLint                                 |
| `typecheck`   | TypeScript without emitting            |

## Architecture

```
src/
├─ app/                 # App Router entry points
│  ├─ layout.tsx        # Metadata, fonts, JSON-LD
│  ├─ page.tsx          # Composes all sections
│  ├─ robots.ts         # robots.txt
│  ├─ sitemap.ts        # sitemap.xml
│  └─ opengraph-image.tsx  # Edge-rendered OG image
├─ components/          # Section + interactive components
│  ├─ Topbar / Footer / Hero / Sections / Stats / Heatmap
│  ├─ BootSequence / CommandPalette / Snake / Matrix
│  ├─ Tweaks / QuickFab / GlobalEffects
├─ lib/
│  ├─ site.ts           # Single source of truth for site metadata
│  ├─ data.ts           # Portfolio content (projects, blogs, skills, etc.)
│  ├─ commands.tsx      # Command palette command bodies + palettes
│  ├─ music.ts          # Tiny chiptune via Web Audio
│  └─ stats.ts          # Server-side GitHub + Codeforces fetch + ISR
└─ styles/
   └─ globals.css       # Tailwind v4 + design tokens + ported CLI theme
```

### Data fetching

`src/lib/stats.ts` runs on the server only (`import "server-only"`). All four endpoints use `fetch(..., { next: { revalidate: 3600 } })` so the page caches statically and refreshes hourly on Vercel.

### Interactivity

The original portfolio's IIFE-based JS was decomposed into discrete client components, each registering as small a window-event surface as possible. Cross-component triggers use named CustomEvents:

| Event                | Sender                  | Listener         |
| -------------------- | ----------------------- | ---------------- |
| `nk:open-palette`    | Topbar, Hero, Contact, QuickFab, ⌘K | CommandPalette |
| `nk:open-snake`      | CommandPalette          | Snake            |
| `nk:open-matrix`     | CommandPalette          | Matrix           |
| `nk:open-tweaks`     | CommandPalette          | Tweaks           |

## Deployment

Vercel will detect Next.js automatically. No env vars are required for the public site; `NEXT_PUBLIC_SITE_URL` is optional and only used by metadata helpers.

```bash
vercel deploy --prod
```

## Legacy source

The original static HTML/JS/CSS is preserved under `_legacy/` for reference (gitignored by default).
