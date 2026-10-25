export interface ProjectDeepDive {
  tagline: string;
  problem: string;
  architecture: string;
  systemDesign: string[];
  challenges: string[];
  diagram?: { src: string; alt: string };
}

/**
 * Card media, rendered as terminal output — each shot rests on its `dither`
 * (1-bit, built by `npm run gen:dither`) and resolves to `poster` on
 * scroll-in. The light shot is optional; projects without one show only the
 * dark shot. `video` is extensionless; ProjectMedia appends .webm and .mp4,
 * and the play button only appears once it is set.
 */
export interface ProjectMediaAsset {
  poster: string;
  dither: string;
  posterLight?: string;
  ditherLight?: string;
  video?: string;
  alt: string;
}

export interface Project {
  num: string;
  name: string;
  status: "live" | "wip" | "archive";
  description: string;
  bullets: string[];
  tags: string[];
  links: { live?: string; source: string };
  media?: ProjectMediaAsset;
  deepDive: ProjectDeepDive;
}

export const PROJECTS: Project[] = [
  {
    num: "[001]",
    name: "lockin",
    status: "live",
    description:
      "A notebook your AI coding agents write to over MCP. Claude Code, Codex and Cursor save notes, search them, and pick up where another agent stopped — and you witness everything they write.",
    bullets: [
      "Built an <strong>MCP server (18 tools)</strong> on GCP letting Claude Code, Codex and Cursor resume each other's work from a <span class='acc'>300-token handoff card</span> — goal, what was ruled out, and the next step as file:line.",
      "Stopped agents from trusting outdated notes by <strong>anchoring each note to its Git commit</strong> and filtering replaced notes out of <strong>hybrid search and RAG</strong> at read time, so undoing a rejected update takes a single delete.",
      "Cut database round trips per query from <span class='acc'>4 to 1</span> (about 90 ms per call in production) by moving to <strong>Prisma 7's pg driver adapter</strong> behind a PgBouncer transaction pooler.",
      "A <strong>Claude Code plugin</strong> files every session into the notebook on <span class='hl'>/compact</span> and when it ends, using the PostCompact and SessionEnd hooks.",
      "<strong>Ask your notes</strong> with a model in the browser (WebGPU), a local one (Ollama, LM Studio), or your own API key — answers cite the pages they came from.",
    ],
    tags: ["next.js", "typescript", "postgres", "prisma", "fastapi", "mcp", "docker", "gcp"],
    links: { live: "https://lockin.namankhandelwal.dev/", source: "https://github.com/Sky-walkerX/LockIn" },
    media: {
      poster: "/assets/projects/lockin/thumbnail/dark.jpg",
      dither: "/assets/projects/lockin/thumbnail/dark-dither.png",
      posterLight: "/assets/projects/lockin/thumbnail/light.jpg",
      ditherLight: "/assets/projects/lockin/thumbnail/light-dither.png",
      // extensionless — ProjectMedia appends .webm and .mp4 as <source> siblings
      video: "/assets/projects/lockin/video/demo",
      alt: "LockIn — the open-source notebook your AI coding agents write to",
    },
    deepDive: {
      tagline: "mcp notebook for ai coding agents · next.js + postgres",
      problem:
        "What you learn inside a Claude Code or Codex session — why a bug happened, why one design beat another, the command that finally worked — is gone when the session ends, and next week a different agent starts from zero. Worse, agents that do remember trust notes the code has already moved past. Stale memory outranking the current fact is the common complaint about agent memory tools.",
      architecture:
        "A Next.js 16 app on Postgres 17 + Prisma, exposing an MCP server at /api/mcp that any MCP client can connect to with one command from Settings. Notes are filed by subject and carry who wrote them. Embeddings run in an optional Python (FastAPI) ingest service or in the browser, and keyword search always works without them. AGPL-3.0, hosted on GCP, or self-hosted with one docker compose up.",
      systemDesign: [
        "Witnessing: every note an agent saves shows which agent wrote it and stays 'to witness' until you've read it. An agent can only edit notes it wrote; anyone else's it can only append to.",
        "Commit anchoring: a note about code records the repo, the commit, that commit's date and the files it describes. The next agent is told to run git diff <commit> -- <files> first, then confirms the note, writes a replacement, or flags it for you.",
        "Replacement: a replacement retires the old note only once you witness it. From then on search and Ask skip the old page at read time, so rejecting an update is a single delete — no rewrite of the old note.",
        "Contradictions at write time: saving a note returns existing notes that look related (embedding similarity, or full-text when the embedder is down). The notebook runs no model of its own — the saving agent decides, and calls link_replacement if its note makes an older one wrong.",
        "Handoffs: when an agent hits its usage cap mid-task, save_handoff leaves a short card (goal, where it stands, what was ruled out, next step as file:line, pages to read first). Durable notes and unfinished working state are kept apart on purpose.",
      ],
      challenges: [
        "Capturing sessions from a remote server: Claude Code's PreCompact hook only gets a local transcript path a remote server can't read, so the plugin captures after compaction — PostCompact receives the summary itself and passes it straight to an MCP tool.",
        "SessionEnd has a 1.5s budget, so the plugin starts a detached claude -p on Haiku that resumes a fork of the session, summarises what came after the last compaction, and files it through the same MCP server — each session stays one note that later captures append to.",
        "Connection overhead on a pooled database: four round trips per query became one by moving to Prisma 7's pg driver adapter behind PgBouncer in transaction mode — about 90 ms saved per call in production.",
      ],
    },
  },
  {
    num: "[002]",
    name: "trequila",
    status: "live",
    description:
      "A full-stack AI travel planner that turns a single prompt into a complete trip itinerary — places, weather, photos, all streamed in real time.",
    bullets: [
      "Distributed, event-driven Go backend on <strong>NATS JetStream</strong>, fanning each HTTP request across <strong>4 parallel micro-workers</strong> — cut end-to-end latency from <span class='acc'>~2.5 min to 50–60s</span>.",
      "Streamed partial itineraries to the Next.js frontend via <strong>Server-Sent Events</strong>, putting first results on screen in <span class='acc'>under 8s</span>.",
      "Ranked spots with a <strong>linear ML model</strong> trained offline over 50 destinations, then sequenced daily routes to minimize travel distance via a <strong>2-opt greedy TSP solver</strong>.",
      "Managed five independent async state slices arriving out of order, driving a live stage-progress UI with per-stage counts instead of one loading spinner.",
    ],
    tags: ["go", "nats", "postgres", "redis", "next.js", "maplibre-gl", "heroku"],
    links: { live: "https://trequila.namankhandelwal.dev/", source: "https://github.com/Sky-walkerX/trequila" },
    media: {
      poster: "/assets/projects/trequila/thumbnail/dark.jpg",
      dither: "/assets/projects/trequila/thumbnail/dark-dither.png",
      posterLight: "/assets/projects/trequila/thumbnail/light.jpg",
      ditherLight: "/assets/projects/trequila/thumbnail/light-dither.png",
      // extensionless — ProjectMedia appends .webm and .mp4 as <source> siblings
      video: "/assets/projects/trequila/video/demo",
      alt: "Trequila — AI travel itinerary generator",
    },
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
      diagram: {
        src: "/assets/projects/trequila/diagram.png",
        alt: "trequila architecture — Next.js client, API route, NATS JetStream, four fan-out workers, Postgres, Redis, and an SSE gateway",
      },
    },
  },
  {
    num: "[003]",
    name: "skillswap",
    status: "live",
    description:
      "A peer-to-peer skill exchange platform with real-time end-to-end encrypted chat and WebRTC video calling.",
    bullets: [
      "Led <strong>backend systems design</strong> in a 4-member team for a P2P skill exchange platform with real-time <strong>end-to-end encrypted</strong> chat.",
      "Engineered a concurrent <strong>WebSocket Hub</strong> in Go handling real-time fan-out, optimistic updates, typing indicators and WebRTC-based video calling.",
      "E2EE messaging via <strong>X25519 key exchange</strong> + XSalsa20-Poly1305, and <strong>LiveKit</strong>-powered video calls — backed by Vitest unit tests covering the crypto and chat layers.",
    ],
    tags: ["go", "postgres", "websocket", "cryptography", "livekit", "next.js", "typescript", "docker"],
    links: { live: "https://skillswap.anirudhrajora.dev/", source: "https://github.com/Sky-walkerX/Skill-swap" },
    media: {
      poster: "/assets/projects/skillswap/thumbnail/dark.jpg",
      dither: "/assets/projects/skillswap/thumbnail/dark-dither.png",
      posterLight: "/assets/projects/skillswap/thumbnail/light.jpg",
      ditherLight: "/assets/projects/skillswap/thumbnail/light-dither.png",
      alt: "SkillSwap — peer-to-peer skill exchange",
    },
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
      diagram: {
        src: "/assets/projects/skillswap/diagram.png",
        alt: "skillswap sequence diagram — Client A and Client B exchanging E2EE messages through the Gin + WebSocket Hub server, then negotiating LiveKit SFU media directly",
      },
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
    date: "May 2026 — Aug 2026",
    bullets: [
      "Selected <span class='acc'>1 of 50</span> among <strong>3,272</strong> global applicants (top 1.5%).",
      'Shipped <strong>60+ merged pull requests</strong> to production for the <strong>Formstr Super App</strong>, maintaining <span class=\'acc\'>88–91%</span> statement coverage across <strong>778 Vitest</strong> unit and end-to-end tests in 97 test suites. <a href="https://github.com/search?q=is:pr+is:merged+author:Sky-walkerX+org:formstr-hq&type=pullrequests" target="_blank" rel="noopener">view contributions →</a>',
      "Architected <strong>@formstr/mcp</strong>, an MCP server whose <strong>50+ tools</strong> let AI agents run forms, calendar, notes and Kanban.",
      "Engineered the <strong>Kanban and Calendar SDKs</strong> with role-based permissions and reactive local-relay stores.",
      "Fixed a <strong>critical security vulnerability</strong> leaking NIP-44 wrapped events and cryptographic signing keys into client exports.",
    ],
  },
  {
    branch: "└──",
    role: "Coordinator, Web Development Wing · Senior Member, FOSS Wing",
    company: "Axios · IIIT Lucknow",
    date: "Aug 2026 — Present",
    bullets: [
      "Conducted <strong>30+ sessions</strong> on Web Development and FOSS, covering Linux, Git, JavaScript, React and DevOps.",
      'Built the society\'s website, <a href="https://axiosiiitl.dev" target="_blank" rel="noopener">axiosiiitl.dev</a>, to showcase its work and activities.',
      "Core member since Sep 2025 — mentored <strong>200+ students</strong> and organised competitive events.",
    ],
  },
];

export const SKILLS = [
  { key: "languages   =", values: ["TypeScript", "JavaScript", "Python", "Go", "C++", "C", "Java", "Bash"] },
  { key: "frameworks  =", values: ["React", "Next.js", "Node.js", "Express", "FastAPI", "Gin", "Vitest", "TailwindCSS"] },
  { key: "devops      =", values: ["Git", "GitHub Actions", "CI/CD", "Linux", "Docker", "GCP", "AWS", "Vercel", "Heroku", "Cloudflare"] },
  { key: "databases   =", values: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma"] },
  { key: "infra       =", values: ["MCP", "NATS JetStream", "WebSocket", "WebRTC", "LiveKit", "Server-Sent Events", "Microservices", "Distributed Systems"] },
] as const;

/**
 * Visual weight of an achievement line.
 * s — global/national placements  ·  a — sustained rating identity  ·  b — individual rounds
 * Rendered as a class on the `<li>`; see `.ach li.s|.a|.b` in globals.css.
 */
export type AchievementTier = "s" | "a" | "b";

export interface Achievement {
  text: string;
  tier: AchievementTier;
}

/** Ordered by tier — s, then a, then b. The renderer does not sort. */
export const ACHIEVEMENTS: Achievement[] = [
  { text: "<strong>ICPC Regionalist 2026</strong> (India) · ranked <strong>AIR 137</strong> in the ICPC India Prelims 2025.", tier: "s" },
  { text: "<strong>Rank 146</strong> globally in Google CTF 2025.", tier: "s" },
  {
    text: "<strong>534th</strong> globally in Meta Hacker Cup 2025 Round 1 · 1434th in Round 2.",
    tier: "s",
  },
  {
    text: "Expert on Codeforces (peak <strong>1623</strong>) · 4★ on CodeChef (peak <strong>1813</strong>) · Knight on LeetCode (peak <strong>1945</strong>).",
    tier: "a",
  },
  {
    text: "<strong>1500+</strong> problems solved across Codeforces, LeetCode, CodeChef and CSES.",
    tier: "a",
  },
  {
    text: "Contributions across <span class='hl'>tauri</span>, <span class='hl'>fedimint</span>, and <span class='hl'>Checkmate</span> ecosystems.",
    tier: "a",
  },
  {
    text: "Rank 89 in CodeChef Starters 176 · Rank 103 in Starters 225 · Rank 104 in Starters 198.",
    tier: "b",
  },
  {
    text: "<strong>Rank 399</strong> in Educational Codeforces Round 191 (Div. 2) · <strong>Rank 926</strong> in Codeforces Round 1103 (Div. 3).",
    tier: "b",
  },
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
    href: "https://medium.com/@skywalkerX/setting-up-nextauth-authjs-with-credentials-and-oauth-google-github-etc-in-next-js-38414db20972",
  },
  {
    meta: "// 02 · nextjs-internals.md",
    title: "Next.js Under the Hood",
    description:
      "A deep dive into the inner workings of Next.js — architecture, rendering strategies, and performance optimizations. How SSR, SSG, and client-side navigation actually fit together.",
    tags: ["next.js", "web-dev", "performance", "ssr", "ssg", "edge-functions"],
    href: "https://medium.com/@skywalkerX/nextjs-under-the-hood-8fd40a64079b",
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
    name: "Flipkart GridLock 2.0",
    sub: "<span class='acc'>1st in Round 1</span> among 35,000+ registered participants · through to the prototype round",
    date: "2026",
  },
  {
    medal: "★",
    name: "Amazon HackOn 6.0",
    sub: "<span class='acc'>Top 300</span> out of 21,000 teams · shortlisted nationally",
    date: "2026",
  },
  {
    medal: "★",
    name: "DevMatrix Hackathon",
    sub: "<span class='acc'>Winner</span> · conducted by Axios · IIIT Lucknow · 2nd year category",
    date: "2026",
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
