export interface ProjectDeepDive {
  tagline: string;
  problem: string;
  architecture: string;
  systemDesign: string[];
  challenges: string[];
  diagram?: string;
}

export interface Project {
  num: string;
  name: string;
  status: "live" | "wip" | "archive";
  description: string;
  bullets: string[];
  tags: string[];
  links: { live?: string; source: string };
  deepDive: ProjectDeepDive;
}

export const PROJECTS: Project[] = [
  {
    num: "[001]",
    name: "trequila",
    status: "live",
    description:
      "A full-stack AI travel planner that turns a single prompt into a complete trip itinerary — places, weather, photos, all streamed in real time.",
    bullets: [
      "Event-driven Go backend on <strong>NATS JetStream</strong>, orchestrating parallel micro-workers — cut response time by 60%.",
      "Streaming pipeline using <strong>Server-Sent Events</strong> to deliver partial updates instantly to the Next.js frontend.",
    ],
    tags: ["next.js", "go", "nats", "postgres", "redis", "gemini"],
    links: { live: "https://www.trequila.tech/", source: "https://github.com/Sky-walkerX/trequila" },
    deepDive: {
      tagline: "AI travel planner · go + nats + next.js",
      problem:
        "Generating a full trip itinerary needs to fan out to many slow upstreams (LLM, places, weather, photos). A single linear request blocks for 15+ seconds. Users want progressive results that feel instant.",
      architecture:
        "Event-driven Go backend. Each prompt produces a TripPlan event on NATS JetStream. Parallel micro-workers (placesWorker, weatherWorker, photoWorker, geminiWorker) consume the event, fan out to upstream APIs, and publish partial results on per-trip subjects. A frontend gateway streams the merged stream over SSE to a Next.js client.",
      systemDesign: [
        "Producer: Next.js API route validates the prompt, persists a TripPlan row in Postgres (status=draft), and publishes trip.plan.requested to JetStream.",
        "Consumers: 4 independent worker pools subscribed via durable consumers — at-least-once delivery, ack on success, redelivery on failure.",
        "Cache: Redis stores upstream API responses (place IDs, weather, photo URLs) keyed by (provider, query). Saves ~70% of repeat calls.",
        "Circuit breaker: a failing upstream (e.g. Gemini overload) trips after 5 consecutive 5xx — the gateway falls back to a cached/cheaper provider and the trip still completes.",
        "SSE gateway: subscribes to trip.<id>.* and pipes events to the client. Reconnect-safe via Last-Event-ID.",
      ],
      challenges: [
        "Ordering partial updates so the UI doesn't flash old data — solved with monotonically-increasing per-trip sequence numbers.",
        "Handling upstream cost spikes — hard cap on Gemini tokens per trip, surfaced as a soft warning in the UI.",
      ],
      diagram: `┌──────────────┐  prompt   ┌────────────┐  publish    ┌──────────────────────┐
│ Next.js page │ ────────▶ │ /api/plan  │ ───────────▶ │ NATS JetStream       │
└──────────────┘           └────────────┘              │  trip.plan.requested │
        ▲                                              └──────────┬───────────┘
        │ SSE stream                                              │ fan-out
        │                                                         ▼
┌───────┴───────┐  subscribe   ┌──────────────────────────────────────────────┐
│ SSE gateway   │ ◀──────────  │ places · weather · photos · gemini workers   │
└───────────────┘              └──────────────────┬───────────────────────────┘
                                                  │
                                  ┌───────────────┴──────────────┐
                                  ▼                              ▼
                          ┌───────────────┐              ┌──────────────┐
                          │ Postgres      │              │ Redis cache  │
                          └───────────────┘              └──────────────┘`,
    },
  },
  {
    num: "[002]",
    name: "skillswap",
    status: "live",
    description:
      "A peer-to-peer skill exchange platform with real-time end-to-end encrypted chat and WebRTC video calling.",
    bullets: [
      "E2EE messaging via <strong>X25519 key exchange</strong> + XSalsa20-Poly1305 (TweetNaCl).",
      "WebSocket Hub in Go with optimistic updates, typing indicators, multi-tab support, and <strong>LiveKit</strong>-powered video.",
    ],
    tags: ["next.js", "go", "gin", "postgres", "websocket", "livekit", "docker"],
    links: { live: "https://skillswap.anirudhrajora.dev/", source: "https://github.com/Sky-walkerX/Skill-swap" },
    deepDive: {
      tagline: "P2P skill exchange · e2ee + livekit",
      problem:
        "Strangers swap skills over 1:1 chat and video. Messages must be unreadable to the server, video must connect in under a second, and the experience must survive multi-tab sessions and flaky networks.",
      architecture:
        "Go (Gin) backend with a WebSocket Hub for chat, and a thin REST layer for LiveKit room tokens. End-to-end encryption is client-side only — keys never touch the server. Postgres stores ciphertext, public keys, and metadata.",
      systemDesign: [
        "Key exchange: X25519 ECDH on the client. Each user has a long-lived identity keypair and a per-session ephemeral pair. Shared secret derives the symmetric key.",
        "Cipher: XSalsa20-Poly1305 via TweetNaCl. Server only sees ciphertext + nonce + sender pubkey.",
        "Hub: in-memory map of userId → []*conn. Broadcast goroutine fans messages out to all of a user's tabs. Backpressure via per-conn buffered send channel; slow consumers are dropped, not blocked.",
        "Delivery: messages are acked once persisted. Typing indicators are ephemeral pubsub, not stored.",
        "Video: server mints a LiveKit JWT scoped to a single room. Clients negotiate SFU directly with LiveKit — server is out of the data path.",
      ],
      challenges: [
        "Optimistic UI vs ordering: client renders the message instantly, then reconciles with the server's canonical timestamp. Race resolved by client-generated UUIDs.",
        "Multi-tab consistency: the hub broadcasts to every open conn; each tab reconciles independently against IndexedDB.",
      ],
      diagram: `Client A                       Server (Gin + Hub)                        Client B
   │       WS upgrade  ─▶                  │                                  │
   │  ◀── auth ok                          │                                  │
   │                                       │                                  │
   │  encrypt(msg, sharedKey)              │                                  │
   │  ───────────────▶ ciphertext          │   route to userId=B              │
   │                                       │   broadcast to B's conns ─────▶  │
   │                                       │                                  │  decrypt(ciphertext, sharedKey)
   │  ◀──── ack (server-side timestamp) ── │                                  │
   │                                       │                                  │
   │       ─────── LiveKit token ─────▶    │                                  │
   │  ◀────── room JWT                     │                                  │
   │     ───────── SFU media (E2E SRTP) ───────────────────────────────────▶  │`,
    },
  },
  {
    num: "[003]",
    name: "lockin",
    status: "live",
    description:
      "A personal study & resource hub organized around Subjects — plan milestones, stash resources, and track focus time. You're the brain; LockIn is the shelf + planner, not an AI generator.",
    bullets: [
      "One component tree, two looks via <strong>next-themes</strong> — Creative (light, neobrutalist) and Focus (dark, editor-calm).",
      "Cross-subject <strong>Today</strong> view for due/overdue tasks; a Pomodoro/stopwatch focus timer logs time per task into a GitHub-style heatmap.",
    ],
    tags: ["next.js", "react", "typescript", "prisma", "postgres", "next-auth", "tanstack-query", "tailwind"],
    links: { live: "https://lockin.namankhandelwal.dev/", source: "https://github.com/Sky-walkerX/LockIn" },
    deepDive: {
      tagline: "study & resource hub · subjects → milestones → tasks",
      problem:
        "Most study tools are either dumb TODO lists or AI generators that do your thinking for you. LockIn keeps the human as the brain: one place to organize learning around Subjects, break each into ordered Milestones and Tasks, save resources, and see what's due today across everything.",
      architecture:
        "Single Next.js App-Router app (React 19, TypeScript). Prisma + Postgres model a strict Subject → Milestone → Task → TimerSession tree (plus Subject → Resource). NextAuth v4 (JWT) for auth, TanStack Query for the data layer, and shadcn/ui + Tailwind v4 + next-themes for a two-mode design system.",
      systemDesign: [
        "Data model: User → Subject → Milestone → Task → TimerSession, and Subject → Resource. Milestone/subject progress is derived (% of tasks done), never stored — no drift.",
        "Ownership scoping: every write is Prisma-scoped to the JWT's user; Milestones (no userId) are scoped through their parent subject.",
        "Two-mode theming: the same component tree renders Creative (light, neobrutalist) or Focus (dark, editor) purely via CSS tokens flipped by next-themes — per-subject accent colors auto-soften in Focus.",
        "Focus timer: POST /api/tasks/[id]/timer start/stop closes the open session and increments the task's time-spent in a single transaction.",
        "Today view: one /api/tasks?today=true query returns incomplete tasks due by end-of-day across all subjects.",
      ],
      challenges: [
        "Deriving progress, streaks, and focus minutes from an append-only task/timer history instead of stored counters — kills the drift that plagued the gamified predecessor.",
        "A `$` in the Postgres password silently broke runtime auth (Next.js dotenv-expand mangles `$`) — fixed by percent-encoding it as %24 in DATABASE_URL.",
      ],
      diagram: `User
 └─ Subject ("Operating Systems")
     ├─ Milestone (notes.md) ──< Task ──< TimerSession
     │                            priority · dueDate
     └─ Resource  (LINK · AI_CHAT · PDF · BOOK)

Today  ◀──  tasks where dueDate ≤ end-of-day, across all subjects`,
    },
  },
];

export interface Experience {
  role: string;
  company: string;
  date: string;
  branch: "├──" | "└──";
  bullets: string[];
}

export const EXPERIENCES: Experience[] = [
  {
    branch: "├──",
    role: "Summer of Bitcoin Intern",
    company: "Formstr",
    date: "May 2026 — Present",
    bullets: [
      "Building the <strong>Formstr Super App</strong> — book events, manage files, create forms, and view analytics with AI as the interface, powered by <strong>MCP tool calling</strong>.",
      "Built <strong>@formstr/mcp</strong> (MCP server exposing the super-app to LLM hosts over stdio with secure auth) and <strong>@formstr/calendar-sdk</strong> (npm package for encrypted Nostr calendar events + RSVPs); authored <strong>700+ Vitest tests</strong>.",
      'Contributed <strong>50+ merged PRs</strong> across core repositories. <a href="https://github.com/Sky-walkerX" target="_blank" rel="noopener">view contributions →</a>',
    ],
  },
  {
    branch: "├──",
    role: "Member, Web Development Wing",
    company: "Axios · IIIT Lucknow",
    date: "2024 — Present",
    bullets: [
      "Technical society of IIIT Lucknow — building internal tools and running workshops on full-stack dev.",
    ],
  },
  {
    branch: "└──",
    role: "Member, FOSS Wing",
    company: "Axios · IIIT Lucknow",
    date: "2024 — Present",
    bullets: ["Open-source advocacy + contributing to projects across Rust, Go, and TypeScript ecosystems."],
  },
];

export const SKILLS = [
  { key: "languages   =", values: ["JavaScript", "TypeScript", "Go", "C", "C++", "Python", "Java", "Bash"] },
  { key: "frameworks  =", values: ["React", "Next.js", "Node", "Express", "Gin", "TailwindCSS"] },
  { key: "devops      =", values: ["Git", "GitHub", "Linux", "Docker", "Vercel", "Heroku", "Cloudflare"] },
  { key: "databases   =", values: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma"] },
  { key: "infra       =", values: ["NATS JetStream", "WebSocket", "WebRTC", "LiveKit", "Server-Sent Events"] },
] as const;

export const ACHIEVEMENTS: string[] = [
  "Placed <strong>137th</strong> in ICPC India Prelims 2025.",
  "<strong>Rank 146</strong> globally in Google CTF.",
  "<strong>534th</strong> globally in Meta Hacker Cup 2025 Round 1 · 1434th in Round 2.",
  "Finalist in the Odoo Hackathon — <strong>19,000+</strong> teams.",
  "Expert on Codeforces (peak <strong>1623</strong>) · 4★ on CodeChef (peak <strong>1813</strong>) · Knight on LeetCode (peak <strong>1945</strong>).",
  "Rank 89 in CodeChef Starters 176 · Rank 103 in Starters 225 · Rank 104 in Starters 198.",
  "<strong>Rank 399</strong> in Educational Codeforces Round 191 (Div. 2) · <strong>Rank 926</strong> in Codeforces Round 1103 (Div. 3).",
  "Contributions across <span class='hl'>tauri</span>, <span class='hl'>fedimint</span>, and <span class='hl'>Checkmate</span> ecosystems.",
];

export interface NotableContrib {
  repo: string;
  org: "tauri" | "fedimint" | "checkmate" | "formstr";
  number: number | null;
  title: string;
  status: "merged" | "open" | "review";
  url: string;
}

export const NOTABLE_CONTRIBS: NotableContrib[] = [
  {
    repo: "tauri-apps/tauri",
    org: "tauri",
    number: 13830,
    title: "feat(window): add macOS window::set_simple_fullscreen",
    status: "merged",
    url: "https://github.com/tauri-apps/tauri/pull/13830",
  },
  {
    repo: "tauri-apps/tauri",
    org: "tauri",
    number: 13618,
    title: "fix(cli): prevent .app identifier",
    status: "merged",
    url: "https://github.com/tauri-apps/tauri/pull/13618",
  },
  {
    repo: "bluewave-labs/Checkmate",
    org: "checkmate",
    number: 2504,
    title: "refactor(settings): moved email settings toggle buttons to end of line",
    status: "merged",
    url: "https://github.com/bluewave-labs/Checkmate/pull/2504",
  },
  {
    repo: "fedimint/fedimint",
    org: "fedimint",
    number: 8377,
    title: "feat: expose LNURL verify and pay methods to WASM",
    status: "merged",
    url: "https://github.com/fedimint/fedimint/pull/8377",
  },
  {
    repo: "formstr-hq/nostr-calendar",
    org: "formstr",
    number: 89,
    title: "feat: appointment scheduling",
    status: "merged",
    url: "https://github.com/formstr-hq/nostr-calendar/pull/89",
  },
];

export interface Blog {
  meta: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
}

export const BLOGS: Blog[] = [
  {
    meta: "// 01 · nextauth.md",
    title: "Setting up NextAuth (Auth.js) with Credentials and OAuth in Next.js",
    description:
      "A comprehensive guide to integrating NextAuth into your Next.js app — credentials-based auth + OAuth providers like Google & GitHub. Covers setup, config, and best practices for a secure auth flow.",
    tags: ["authentication", "next.js", "nextauth", "oauth", "google", "github"],
    href: "https://namankhandelwal.me",
  },
  {
    meta: "// 02 · nextjs-internals.md",
    title: "Next.js Under the Hood",
    description:
      "A deep dive into the inner workings of Next.js — architecture, rendering strategies, and performance optimizations. How SSR, SSG, and client-side navigation actually fit together.",
    tags: ["next.js", "web-dev", "performance", "ssr", "ssg", "edge-functions"],
    href: "https://namankhandelwal.me",
  },
];

export interface Hackathon {
  medal: string;
  name: string;
  sub: string;
  date: string;
  placeholder?: boolean;
}

export const HACKATHONS: Hackathon[] = [
  {
    medal: "★",
    name: "Flipkart Gridlock 2026",
    sub: "<span class='acc'>1st in Round 1</span> · through to the prototype round",
    date: "2026",
  },
  {
    medal: "★",
    name: "Amazon HackOn 2026",
    sub: "<span class='acc'>Top 300 teams</span> · shortlisted nationally",
    date: "2026",
  },
  {
    medal: "★",
    name: "DevMatrix Hackathon",
    sub: "<span class='acc'>Winner</span> · conducted by Axios · IIIT Lucknow · 2nd year category",
    date: "2025",
  },
  {
    medal: "★",
    name: "Odoo Hackathon",
    sub: "<span class='acc'>Finalist</span> · qualified out of 19,000+ teams · 48-hour full-stack build",
    date: "2025",
  },
  {
    medal: "+",
    name: "more hackathons in flight",
    sub: "$ git push origin main — entries land here when results drop",
    date: "—",
    placeholder: true,
  },
];
