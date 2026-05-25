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
    links: { source: "https://github.com/Sky-walkerX" },
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
    links: { source: "https://github.com/Sky-walkerX" },
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
    name: "planwise",
    status: "live",
    description:
      "A gamified task management app that helps you stay organized, set priorities, and track progress — with XP, levels, and a daily heatmap to keep you motivated.",
    bullets: [
      "Gamified progress system — <strong>XP per task</strong>, level progression, daily streak heatmap.",
      "Type-safe data layer with <strong>Prisma + Tanstack Query</strong> for optimistic mutations.",
      "Credentials + OAuth (Google / GitHub) auth via NextAuth.",
    ],
    tags: ["next.js", "tailwind", "typescript", "prisma", "next-auth", "tanstack-query"],
    links: { live: "https://github.com/Sky-walkerX", source: "https://github.com/Sky-walkerX" },
    deepDive: {
      tagline: "gamified task manager · xp + heatmap",
      problem:
        "Most TODO apps fail because they don't reward consistency. Planwise treats task completion as XP, levels, and a streak heatmap — making habit-formation visible.",
      architecture:
        "Single Next.js app on the App Router with Server Actions for mutations. Prisma + Postgres for the data layer. Tanstack Query for optimistic UI on the client. NextAuth for credentials + OAuth (Google, GitHub).",
      systemDesign: [
        "Schema: User → Tasks (1:N), User → XPEvents (1:N). Tasks carry a difficulty enum that maps to an XP table.",
        "XP / level: pure derived value — XPEvents are append-only, current level is computed at read time. Avoids drift and supports retroactive corrections.",
        "Streak heatmap: a single SQL view aggregates task completions by day. Cached in Tanstack Query, invalidated on mutation.",
        "Auth: NextAuth with the Prisma adapter. Credentials hashed via Argon2id. OAuth callbacks linked to the same user by email.",
        "Optimistic updates: complete-task mutates the cache immediately, server action returns the canonical XP delta, cache reconciles.",
      ],
      challenges: [
        "Preventing XP farming via rapid create-complete cycles — server-side daily XP cap per difficulty bucket.",
        "Designing the difficulty curve so leveling stays satisfying past level 30 — exponential XP-per-level with a flat ceiling on daily gain.",
      ],
    },
  },
  {
    num: "[004]",
    name: "zonic",
    status: "live",
    description:
      "A Spotify-integrated web app for music and podcasts — browse your library and play tracks, with contextual insights like artist news, weather, and related GIFs.",
    bullets: [
      "OAuth flow against the <strong>Spotify Web API</strong> — library browse + playback control.",
      "Contextual data fanout: artist news, weather, and related GIFs alongside each track.",
      "Express + Node backend; React frontend with Tailwind.",
    ],
    tags: ["react", "tailwind", "expressjs", "node.js", "typescript", "spotify-api"],
    links: { live: "https://github.com/Sky-walkerX", source: "https://github.com/Sky-walkerX" },
    deepDive: {
      tagline: "spotify-integrated music & podcasts",
      problem:
        "Spotify is a great player but a thin information layer. Listening should pull in the artist's recent news, related media, and even the weather where they're from — without leaving the player.",
      architecture:
        "React + Vite SPA fronts an Express/Node backend that brokers Spotify OAuth and fans out to contextual data sources (news, weather, GIF). The frontend never sees a Spotify secret; the backend owns the refresh-token loop.",
      systemDesign: [
        "OAuth: Authorization Code with PKCE. Backend stores the refresh token in an HTTP-only cookie session; the frontend gets a short-lived access token.",
        "Playback: SDK runs in the browser. Backend issues device-control intents (play/pause/seek) only after validating the session.",
        "Context fanout: on track change the frontend asks /api/context?artist=… ; backend hits News API, OpenWeather, and Giphy in parallel and returns a merged payload.",
        "Caching: in-memory LRU (5-min TTL) keyed by artist — keeps external API spend predictable when users repeatedly skip back.",
      ],
      challenges: [
        "Token refresh while music is playing — backend rotates tokens in the background and pushes the new access token over Server-Sent Events.",
        "Rate-limit budgeting across 3 free-tier APIs — single context request batches all three providers and surfaces a partial response if any fails.",
      ],
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
      "Building the <strong>Formstr Super App</strong> — a unified platform for calendar events, private notes, file management, forms, and analytics, with AI as the interface layer.",
      'Contributed <strong>35+ PRs</strong> across core repositories. <a href="https://github.com/Sky-walkerX" target="_blank" rel="noopener">view contributions →</a>',
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
  "Specialist on Codeforces (peak <strong>1526</strong>) · 4★ on CodeChef (peak <strong>1813</strong>).",
  "Rank 89 in CodeChef Starters 176 · Rank 103 in Starters 225 · Rank 104 in Starters 198.",
  "Contributions across <span class='hl'>tauri</span>, <span class='hl'>fedimint</span>, and <span class='hl'>Checkmate</span> ecosystems.",
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
