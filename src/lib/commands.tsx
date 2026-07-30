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
  "tree",
  "cd projects",
  "view trequila",
  "cat achievements.log",
  "ls blogs",
  "email",
  "resume",
  "fortune",
  "snake",
  "neofetch",
  "sudo hire naman",
  "cmatrix",
  "theme",
] as const;
