export interface Project {
  num: string;
  name: string;
  status: "live" | "wip" | "archive";
  description: string;
  bullets: string[];
  tags: string[];
  links: { live?: string; source: string };
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
