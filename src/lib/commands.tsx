import { SITE } from "./site";

export interface ProjectInfo {
  name: string;
  tagline: string;
  status: "live" | "wip" | "archive";
  desc: string;
  tech: string[];
  highlights: string[];
  links: { repo: string; demo: string | null };
}

export const PROJECTS_DEEP: Record<string, ProjectInfo> = {
  trequila: {
    name: "trequila",
    tagline: "AI travel planner · go + nats + next.js",
    status: "live",
    desc: "A full-stack AI travel planner that turns a single prompt into a complete trip itinerary — places, weather, photos, all streamed in real time.",
    tech: ["Next.js", "Go", "NATS JetStream", "PostgreSQL", "Redis", "Gemini API"],
    highlights: [
      "Event-driven Go backend on NATS JetStream — parallel micro-workers cut response time by 60%",
      "Server-Sent Events streaming pipeline delivers partial results instantly to the Next.js client",
      "Postgres + Redis caching with circuit-breaker fallback so one failing upstream API never breaks the trip",
    ],
    links: { repo: SITE.github, demo: null },
  },
  skillswap: {
    name: "skillswap",
    tagline: "P2P skill exchange · e2ee + livekit",
    status: "live",
    desc: "A peer-to-peer skill exchange platform with real-time end-to-end encrypted chat and WebRTC video calling.",
    tech: ["Next.js", "Go", "Gin", "PostgreSQL", "WebSocket", "LiveKit", "Docker"],
    highlights: [
      "E2EE messaging via X25519 key exchange + XSalsa20-Poly1305 (TweetNaCl)",
      "WebSocket Hub in Go with optimistic updates, typing indicators, multi-tab sync",
      "LiveKit-powered WebRTC video with low-latency room joins",
    ],
    links: { repo: SITE.github, demo: "https://skillswap.anirudhrajora.dev/" },
  },
  odoo: {
    name: "odoo-finalist",
    tagline: "hackathon finalist · 19k+ teams",
    status: "archive",
    desc: "Qualified for the finale of the Odoo Hackathon out of 19,000+ teams. Full-stack solution shipped under a 48-hour deadline.",
    tech: ["React", "Node", "PostgreSQL"],
    highlights: [
      "Built and demoed a working full-stack prototype in under 48 hours",
      "Finalist out of 19,000+ teams",
    ],
    links: { repo: SITE.github, demo: null },
  },
  lockin: {
    name: "lockin",
    tagline: "study & resource hub · subjects → milestones → tasks",
    status: "live",
    desc: "A personal study & resource hub organized around Subjects — plan milestones, stash resources, and track focus time. You're the brain; LockIn is the shelf + planner, not an AI generator.",
    tech: ["Next.js", "React", "TypeScript", "Prisma", "PostgreSQL", "Next-Auth", "Tanstack Query", "Tailwind"],
    highlights: [
      "One component tree, two looks via next-themes — Creative (light, neobrutalist) + Focus (dark, editor)",
      "Cross-subject Today view for due/overdue tasks; Pomodoro/stopwatch timer logs focus time into a heatmap",
      "Strict Subject → Milestone → Task → TimerSession tree; progress derived, never stored",
    ],
    links: { repo: "https://github.com/Sky-walkerX/LockIn", demo: "https://lockin.namankhandelwal.dev/" },
  },
};

export const PROJECT_ALIAS: Record<string, string> = {
  t: "trequila",
  ss: "skillswap",
  sk: "skillswap",
  travel: "trequila",
  li: "lockin",
  lock: "lockin",
  study: "lockin",
};

export const FORTUNES = [
  "There are 2 hard problems in computer science: cache invalidation, naming things, and off-by-one errors.",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Premature optimization is the root of all evil. — Donald Knuth",
  "Simplicity is prerequisite for reliability. — Edsger Dijkstra",
  "Make it work, make it right, make it fast. — Kent Beck",
  "The best code is no code at all.",
  "A program is never finished, only abandoned.",
  "Walking on water and developing software from a specification are easy — if both are frozen.",
  "Weeks of coding can save you hours of planning.",
  "It compiles! Ship it.",
  "Real programmers count from zero.",
  "`rm -rf /` is not a valid debugging strategy.",
  "When in doubt, blame the cache.",
  "If debugging is the process of removing bugs, then programming must be the process of putting them in.",
  "Stack Overflow is the rubber duck.",
  "There is no place like 127.0.0.1.",
];

export const ACCENT_PALETTES = {
  violet: { accent: "#7B61FF", hi: "#9985ff" },
  cyan: { accent: "#56D2D6", hi: "#7be5e9" },
  green: { accent: "#6CE5B2", hi: "#8defc8" },
  amber: { accent: "#F0B860", hi: "#ffce80" },
  rose: { accent: "#FF7AA6", hi: "#ff97bd" },
} as const;

export type AccentName = keyof typeof ACCENT_PALETTES;

export function escapeHTML(s: string) {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c];
  });
}

export const SUGGEST_CHIPS = [
  "help",
  "whoami",
  "view trequila",
  "ls projects",
  "email",
  "fortune",
  "snake",
  "neofetch",
  "sudo hire naman",
  "cmatrix",
  "music",
  "theme",
  "tweaks",
] as const;
