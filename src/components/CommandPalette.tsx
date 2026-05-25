"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCENT_PALETTES,
  FORTUNES,
  PROJECTS_DEEP,
  PROJECT_ALIAS,
  SUGGEST_CHIPS,
  escapeHTML,
  type AccentName,
} from "@/lib/commands";
import { SITE } from "@/lib/site";
import { isMusicPlaying, playMusic, stopMusic } from "@/lib/music";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const initRef = useRef(false);
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);

  const append = (html: string, extraClass = "") => {
    const body = bodyRef.current;
    if (!body) return;
    const d = document.createElement("div");
    d.className = `echo${extraClass ? ` ${extraClass}` : ""}`;
    d.innerHTML = html;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  };

  const echoCmd = (cmd: string) => {
    append(
      `<span class="echo-prompt">naman@portfolio:~$</span><span class="echo-cmd">${escapeHTML(cmd)}</span>`,
      "cmd",
    );
  };

  const close = () => setOpen(false);

  const getCurrentAccent = (): AccentName => {
    try {
      const raw = localStorage.getItem("nk:tweaks");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.accent && parsed.accent in ACCENT_PALETTES) return parsed.accent as AccentName;
      }
    } catch {
      /* ignore */
    }
    return "violet";
  };

  const COMMANDS: Record<string, (args: string[]) => void> = {
    help: () =>
      append(`<span class="hl">Available commands</span>
<table>
  <tr><td>help</td><td>show this list</td></tr>
  <tr><td>whoami</td><td>quick intro</td></tr>
  <tr><td>about</td><td>full bio</td></tr>
  <tr><td>ls [dir]</td><td>list projects / skills / experience / hackathons / blogs</td></tr>
  <tr><td>cat &lt;file&gt;</td><td>read about.md / resume / achievements</td></tr>
  <tr><td>view &lt;project&gt;</td><td>quickview a project (trequila, skillswap, odoo)</td></tr>
  <tr><td>open &lt;name&gt;</td><td>open project / link in new tab</td></tr>
  <tr><td>cd &lt;section&gt;</td><td>scroll to section</td></tr>
  <tr><td>email</td><td>copy email to clipboard</td></tr>
  <tr><td>socials</td><td>list social links</td></tr>
  <tr><td>achievements</td><td>list achievements</td></tr>
  <tr><td>resume</td><td>open resume PDF</td></tr>
  <tr><td>theme &lt;name&gt;</td><td>cycle accent (violet, cyan, green, amber, rose)</td></tr>
  <tr><td>tweaks</td><td>open the tweaks panel</td></tr>
  <tr><td>fortune</td><td>random developer wisdom</td></tr>
  <tr><td>cmatrix</td><td>enter the matrix</td></tr>
  <tr><td>neofetch</td><td>system info</td></tr>
  <tr><td>uptime</td><td>session uptime</td></tr>
  <tr><td>sudo &lt;cmd&gt;</td><td>try: sudo hire naman</td></tr>
  <tr><td>music [on/off]</td><td>toggle chiptune background music</td></tr>
  <tr><td>snake</td><td>play snake. hjkl works too.</td></tr>
  <tr><td>date · pwd · echo</td><td>shell basics</td></tr>
  <tr><td>clear</td><td>clear terminal (or Ctrl-L)</td></tr>
  <tr><td>exit</td><td>close terminal</td></tr>
</table>
<span class="muted"># shortcuts: ⌘K to toggle · / to open · Esc to close · ↑/↓ history · Tab complete · j/k scroll page</span>`),

    whoami: () =>
      append(`<span class="hl">Naman Khandelwal</span>
3rd year CS @ <span class="acc">IIIT Lucknow</span> · GPA 8.90
Currently: <span class="acc">Summer of Bitcoin</span> intern @ Formstr
Specialist on CF · 4★ on CodeChef · Google CTF rank 146`),

    about: () =>
      append(`<span class="hl">~/about.md</span>

  I'm a developer who lives between web and systems — building things
  end-to-end, from React frontends down to Go services orchestrated
  over NATS JetStream.

  Right now: shipping the Formstr Super App as part of Summer of Bitcoin.
  Outside of work: competitive programming, CTFs, OSS (tauri, fedimint, Checkmate).

  Open to internships, collabs, and interesting conversations.`),

    ls: (args) => {
      const what = (args[0] || "").replace(/\/$/, "").toLowerCase();
      if (!what || what === "projects" || what === "~/projects") {
        return append(`<table>
<tr><td>001</td><td><span class="acc">trequila/</span></td><td class="muted">AI travel planner</td></tr>
<tr><td>002</td><td><span class="acc">skillswap/</span></td><td class="muted">P2P skill exchange · e2ee + livekit</td></tr>
<tr><td>003</td><td><span class="acc">planwise/</span></td><td class="muted">gamified task manager</td></tr>
<tr><td>004</td><td><span class="acc">zonic/</span></td><td class="muted">spotify music + podcasts</td></tr>
<tr><td>005</td><td><span class="acc">odoo-finalist/</span></td><td class="muted">19k+ teams</td></tr>
</table>
<span class="muted"># view &lt;name&gt; for details · open &lt;name&gt; to open</span>`);
      }
      if (what === "skills" || what === "stack") {
        return append(`<table>
<tr><td>languages</td><td>JavaScript, TypeScript, Go, C, C++, Python, Java, Bash</td></tr>
<tr><td>frameworks</td><td>React, Next.js, Node, Express, Gin, TailwindCSS</td></tr>
<tr><td>devops</td><td>Git, Linux, Docker, Vercel, Heroku, Cloudflare</td></tr>
<tr><td>databases</td><td>PostgreSQL, MySQL, MongoDB, Redis, Prisma</td></tr>
<tr><td>infra</td><td>NATS JetStream, WebSocket, WebRTC, LiveKit</td></tr>
</table>`);
      }
      if (what === "experience") {
        return append(`<table>
<tr><td>2026.05—</td><td><span class="acc">Formstr</span> · Summer of Bitcoin intern</td></tr>
<tr><td>2024—</td><td><span class="acc">Axios IIIT-L</span> · Web Dev Wing + FOSS Wing</td></tr>
</table>`);
      }
      if (what === "hackathons") {
        return append(`<table>
<tr><td>2025</td><td><span class="acc">Odoo Hackathon</span> · Finalist (19k+ teams)</td></tr>
<tr><td>...</td><td class="muted">more on the way</td></tr>
</table>`);
      }
      if (what === "blogs" || what === "~/blogs") {
        return append(`<table>
<tr><td>01</td><td><span class="acc">nextauth.md</span></td><td class="muted">setting up Auth.js with credentials + oauth</td></tr>
<tr><td>02</td><td><span class="acc">nextjs-internals.md</span></td><td class="muted">next.js under the hood</td></tr>
</table>`);
      }
      if (what === "/" || what === "~") {
        return append(`<table>
<tr><td>about.md</td><td class="muted">bio</td></tr>
<tr><td>projects/</td><td class="muted">3 entries</td></tr>
<tr><td>experience/</td><td class="muted">3 entries</td></tr>
<tr><td>hackathons/</td><td class="muted">1 entry · more queued</td></tr>
<tr><td>skills/</td><td class="muted">5 categories</td></tr>
<tr><td>blogs/</td><td class="muted">2 posts</td></tr>
<tr><td>resume.pdf</td><td class="muted">type: resume</td></tr>
</table>`);
      }
      append(`<span class="err">ls: ${escapeHTML(args[0] ?? "")}: No such file or directory</span>`);
    },

    cat: (args) => {
      const f = (args[0] || "").replace(/^~\//, "").toLowerCase();
      if (f === "about.md" || f === "about") return COMMANDS.about([]);
      if (f === "resume.txt" || f === "resume" || f === "resume.pdf") return COMMANDS.resume([]);
      if (f === "achievements" || f === "history.log") return COMMANDS.achievements([]);
      if (!f) return append(`<span class="err">cat: missing file operand</span>\n<span class="muted"># try: cat about.md</span>`);
      append(`<span class="err">cat: ${escapeHTML(args[0] ?? "")}: No such file or directory</span>`);
    },

    view: (args) => {
      const arg = (args[0] || "").toLowerCase();
      const key = PROJECT_ALIAS[arg] || arg.replace(/^\.\//, "");
      const p = PROJECTS_DEEP[key];
      if (!p) {
        return append(
          `<span class="err">view: '${escapeHTML(args[0] ?? "")}' not found.</span>\n<span class="muted">try: view trequila · view skillswap · view odoo</span>`,
        );
      }
      const tech = p.tech.map((t) => `<span class="acc">${t}</span>`).join(", ");
      const bullets = p.highlights.map((h) => `  <span class="acc">▪</span> ${h}`).join("\n");
      const status =
        p.status === "live"
          ? '<span class="ok">[LIVE]</span>'
          : p.status === "wip"
            ? '<span class="warn">[WIP]</span>'
            : '<span class="muted">[ARCHIVE]</span>';
      const links =
        `<a href="${p.links.repo}" target="_blank" rel="noopener">repo ↗</a>` +
        (p.links.demo ? `  <a href="${p.links.demo}" target="_blank" rel="noopener">live ↗</a>` : "");
      append(`<span class="hl">./${p.name}</span> ${status}
<span class="muted">${p.tagline}</span>

${p.desc}

<span class="hl">tech:</span>
  ${tech}

<span class="hl">highlights:</span>
${bullets}

${links}`);
    },

    open: (args) => {
      const name = (args[0] || "").toLowerCase();
      const map: Record<string, string> = {
        trequila: SITE.github,
        skillswap: SITE.github,
        planwise: SITE.github,
        zonic: SITE.github,
        odoo: SITE.github,
        github: SITE.github,
        linkedin: SITE.linkedin,
        site: SITE.url,
        portfolio: SITE.url,
        formstr: "https://formstr.app",
        resume: SITE.resumePath,
        nextauth: SITE.url,
        nextjs: SITE.url,
      };
      if (!name) {
        return append(`<span class="err">open: missing argument</span>\n<span class="muted"># try: open trequila, open github</span>`);
      }
      if (map[name]) {
        window.open(map[name], "_blank", "noopener");
        return append(`<span class="ok">→ opening ${name}</span> <span class="muted">(${map[name]})</span>`);
      }
      append(
        `<span class="err">open: '${escapeHTML(name)}' not found.</span>\n<span class="muted">try: trequila, skillswap, github, linkedin, site, formstr, resume</span>`,
      );
    },

    cd: (args) => {
      const t = (args[0] || "").replace(/^[~/]+/, "").replace(/\/$/, "").toLowerCase();
      const map: Record<string, string> = {
        about: "#about",
        work: "#work",
        projects: "#work",
        experience: "#experience",
        stats: "#stats",
        hackathons: "#hackathons",
        skills: "#skills",
        blogs: "#blogs",
        contact: "#contact",
        "": "#top",
        "~": "#top",
      };
      if (t in map) {
        document.querySelector(map[t])?.scrollIntoView({ behavior: "smooth" });
        append(`<span class="ok">→ cd ~/${t || ""}</span>`);
        window.setTimeout(close, 400);
      } else {
        append(`<span class="err">cd: ${escapeHTML(args[0] ?? "")}: No such directory</span>`);
      }
    },

    email: () => {
      const e = SITE.email;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(e)
          .then(() => append(`<span class="ok">✔ copied to clipboard</span> <a href="mailto:${e}">${e}</a>`))
          .catch(() => append(`<a href="mailto:${e}">${e}</a>`));
      } else {
        append(`<a href="mailto:${e}">${e}</a>`);
      }
    },

    socials: () =>
      append(`<table>
<tr><td>github</td><td><a href="${SITE.github}" target="_blank" rel="noopener">github.com/${SITE.githubHandle}</a></td></tr>
<tr><td>linkedin</td><td><a href="${SITE.linkedin}" target="_blank" rel="noopener">in/naman-khandelwal</a></td></tr>
<tr><td>site</td><td><a href="${SITE.url}" target="_blank" rel="noopener">namankhandelwal.me</a></td></tr>
<tr><td>email</td><td><a href="mailto:${SITE.email}">${SITE.email}</a></td></tr>
</table>`),

    achievements: () =>
      append(`<span class="hl">~/history.log · achievements</span>

  <span class="ok">✔</span> ICPC India Prelims 2025 — <span class="hl">rank 137</span>
  <span class="ok">✔</span> Google CTF — <span class="hl">rank 146</span> globally
  <span class="ok">✔</span> Meta Hacker Cup 2025 — <span class="hl">534</span> R1 · <span class="hl">1434</span> R2
  <span class="ok">✔</span> Odoo Hackathon Finalist — <span class="hl">19k+</span> teams
  <span class="ok">✔</span> Codeforces Specialist — peak <span class="hl">1526</span>
  <span class="ok">✔</span> CodeChef 4★ — peak <span class="hl">1813</span>
  <span class="ok">✔</span> CodeChef Starters — rank 89 / 103 / 104
  <span class="ok">✔</span> OSS contributions to tauri, fedimint, Checkmate`),

    resume: () => {
      append(
        `<span class="ok">→ opening resume</span> <a href="${SITE.resumePath}" target="_blank" rel="noopener">Naman_Khandelwal_Resume.pdf</a>`,
      );
      window.open(SITE.resumePath, "_blank", "noopener");
    },

    theme: (args) => {
      const names = Object.keys(ACCENT_PALETTES) as AccentName[];
      let next: AccentName;
      const requested = (args[0] || "").toLowerCase() as AccentName;
      if (requested && names.includes(requested)) {
        next = requested;
      } else {
        const cur = getCurrentAccent();
        next = names[(names.indexOf(cur) + 1) % names.length];
      }
      window.dispatchEvent(new CustomEvent("nk:open-tweaks", { detail: { accent: next } }));
      append(`<span class="ok">→ theme: <span class="hl">${next}</span></span> <span class="muted">(${ACCENT_PALETTES[next].accent})</span>`);
    },

    tweaks: () => {
      window.dispatchEvent(new Event("nk:open-tweaks"));
      append(`<span class="ok">→ tweaks panel opened</span>`);
      window.setTimeout(close, 400);
    },

    fortune: () => {
      const q = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      append(`<span class="muted">┌─── fortune ───┐</span>
  ${q}
<span class="muted">└───────────────┘</span>`);
    },

    cmatrix: () => {
      append(`<span class="ok">→ entering the matrix</span> <span class="muted">(press any key to exit)</span>`);
      window.setTimeout(() => {
        close();
        window.dispatchEvent(new Event("nk:open-matrix"));
      }, 300);
    },

    matrix: () => COMMANDS.cmatrix([]),

    music: (args) => {
      const arg = (args[0] || "").toLowerCase();
      if (arg === "off" || arg === "stop" || (isMusicPlaying() && !arg)) {
        stopMusic();
        append(`<span class="muted">♪ music: off</span>`);
      } else {
        playMusic();
        append(`<span class="ok">♪ music: on</span> <span class="muted">(chiptune — auto-stops after a bit)</span>`);
      }
    },

    play: (args) => COMMANDS.music(args),

    snake: () => {
      append(`<span class="ok">→ launching snake.exe</span> <span class="muted">(arrows or hjkl)</span>`);
      window.setTimeout(() => {
        close();
        window.dispatchEvent(new Event("nk:open-snake"));
      }, 300);
    },

    date: () => append(`<span class="hl">${escapeHTML(new Date().toString())}</span>`),
    pwd: () => append(`/home/naman`),
    echo: (args) => append(escapeHTML(args.join(" "))),
    clear: () => {
      if (bodyRef.current) bodyRef.current.innerHTML = "";
    },
    exit: () => {
      append(`<span class="muted"># bye.</span>`);
      window.setTimeout(close, 300);
    },
    bye: () => COMMANDS.exit([]),

    sudo: (args) => {
      const sub = args.join(" ").trim().toLowerCase();
      if (!sub) {
        return append(`<span class="err">usage: sudo &lt;command&gt;</span>\n<span class="muted">try: <span class="acc">sudo hire naman</span></span>`);
      }
      if (sub === "hire naman" || sub === "hire" || sub === "hire-naman" || sub === "hire_naman") {
        append(`<span class="warn">[sudo] password for recruiter:</span> <span class="muted">**********</span>`);
        window.setTimeout(() => append(`<span class="ok">✓ authentication successful</span>`), 850);
        window.setTimeout(
          () => append(`<span class="ok">✓ access granted</span> <span class="muted">· redirecting to resume…</span>`),
          1550,
        );
        window.setTimeout(() => window.open(SITE.resumePath, "_blank", "noopener"), 2100);
        return;
      }
      if (sub === "rm -rf /" || sub === "rm -rf" || sub === "rm -rf /*" || sub.startsWith("rm -rf")) {
        return append(`<span class="err">rm: it is dangerous to operate recursively on '/'</span>
<span class="err">rm: use --no-preserve-root to override this failsafe</span>
<span class="muted"># nice try.</span>`);
      }
      if (sub === "make me a sandwich" || sub === "make sandwich") {
        return append(`<span class="ok">okay.</span> <span class="muted">🥪 (we don't do emoji on this site, but — here)</span>`);
      }
      if (sub === "shutdown" || sub === "reboot" || sub === "halt" || sub === "poweroff") {
        append(`<span class="warn">[sudo] password for naman:</span> <span class="muted">**********</span>`);
        window.setTimeout(
          () => append(`<span class="err">permission denied. this terminal cannot be killed.</span>`),
          700,
        );
        return;
      }
      append(`<span class="err">[sudo] password for naman:</span>
<span class="muted">sudo: <span class="hl">${escapeHTML(args.join(" "))}</span>: permission denied. nice try.</span>`);
    },

    neofetch: () => {
      const logo =
        '<span class="acc">  ███╗   ██╗██╗  ██╗</span>\n' +
        '<span class="acc">  ████╗  ██║██║ ██╔╝</span>\n' +
        '<span class="acc">  ██╔██╗ ██║█████╔╝ </span>\n' +
        '<span class="acc">  ██║╚██╗██║██╔═██╗ </span>\n' +
        '<span class="acc">  ██║ ╚████║██║  ██╗</span>\n' +
        '<span class="acc">  ╚═╝  ╚═══╝╚═╝  ╚═╝</span>';
      const themeName = getCurrentAccent();
      const colorBar =
        '<span style="color:#7B61FF">███</span>' +
        '<span style="color:#56D2D6">███</span>' +
        '<span style="color:#6CE5B2">███</span>' +
        '<span style="color:#F0C674">███</span>' +
        '<span style="color:#FF7AA6">███</span>' +
        '<span style="color:#FF6B6B">███</span>' +
        '<span style="color:#f0ede8">███</span>' +
        '<span style="color:#888">███</span>';
      append(
        '<div class="neofetch">' +
          '<pre class="art">' +
          logo +
          "</pre>" +
          '<div class="info">' +
          '<div><span class="hl">naman</span><span class="muted">@</span><span class="hl">portfolio</span></div>' +
          '<div class="muted">---------------</div>' +
          '<div><span class="k">OS</span>:        Portfolio v2.0 (dark)</div>' +
          '<div><span class="k">Host</span>:      IIIT Lucknow · 3rd year</div>' +
          '<div><span class="k">Kernel</span>:    next.js 16 / react 19</div>' +
          '<div><span class="k">Shell</span>:     bash 5.2</div>' +
          '<div><span class="k">DE</span>:        Dark Terminal</div>' +
          `<div><span class="k">Theme</span>:     <span class="acc">${themeName}</span> on black</div>` +
          '<div><span class="k">Font</span>:      JetBrains Mono</div>' +
          '<div><span class="k">Editor</span>:    neovim, btw</div>' +
          '<div><span class="k">CPU</span>:       Caffeine-powered (4.2 GHz)</div>' +
          '<div><span class="k">Memory</span>:    TODO-list / ∞</div>' +
          '<div><span class="k">Packages</span>:  pnpm · cargo · go mod (∞)</div>' +
          "<div>&nbsp;</div>" +
          "<div>" +
          colorBar +
          "</div>" +
          "</div>" +
          "</div>",
      );
    },

    uptime: () => append(`up · 1 user, load average: 0.42, 0.69, 1.00\n<span class="muted"># session started on page load.</span>`),
    vim: () => append(`<span class="err">error: vim is not installed. use j/k to scroll the page instead.</span>`),
    emacs: () => append(`<span class="err">just kidding. type 'help'.</span>`),
    rm: () => append(`<span class="err">rm: refusing to delete me, the developer. try 'help' instead.</span>`),
    nvim: () => append(`<span class="muted">type <span class="acc">:q!</span> &mdash; oh wait, you can't escape vim. <span class="muted">(use 'exit')</span></span>`),
    hello: () => append(`<span class="ok">hello there 👋 type 'help' to begin.</span>`),
    hi: () => COMMANDS.hello([]),
    hey: () => COMMANDS.hello([]),
  };

  const ALIAS: Record<string, string> = {
    man: "help",
    cls: "clear",
    q: "exit",
    quit: "exit",
    sl: "snake",
    h: "help",
    "?": "help",
  };

  const runCommand = (raw: string) => {
    const aliased = ALIAS[raw.toLowerCase()] ?? raw;
    const tokens = aliased.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);
    if (cmd in COMMANDS) {
      try {
        COMMANDS[cmd](args);
      } catch (err) {
        append(`<span class="err">runtime error: ${escapeHTML(String(err))}</span>`);
      }
    } else {
      append(
        `<span class="err">bash: ${escapeHTML(cmd)}: command not found</span>\n<span class="muted"># type 'help' for available commands.</span>`,
      );
    }
  };

  const submit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    historyRef.current.push(trimmed);
    histIdxRef.current = -1;
    echoCmd(trimmed);
    runCommand(trimmed);
    setValue("");
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  };

  const tabComplete = () => {
    const v = value.trim();
    if (!v) return;
    const names = Object.keys(COMMANDS).concat([
      "projects",
      "skills",
      "experience",
      "hackathons",
      "blogs",
      "trequila",
      "skillswap",
      "odoo",
      "about.md",
      "resume.pdf",
    ]);
    const match = names.filter((n) => n.startsWith(v));
    if (match.length === 1) setValue(match[0] + " ");
    else if (match.length > 1) append(`<span class="muted">${match.join("   ")}</span>`);
  };

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);
    window.addEventListener("nk:open-palette", onOpen);
    window.addEventListener("nk:close-palette", onClose);

    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      const inField = tag === "INPUT" || tag === "TEXTAREA";
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "/" && !inField) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen((prev) => {
          if (prev) return false;
          return prev;
        });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("nk:open-palette", onOpen);
      window.removeEventListener("nk:close-palette", onClose);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 30);
    if (!initRef.current) {
      initRef.current = true;
      append(`<span class="muted">last login: Mon May 25 2026 on ttys001</span>`);
      append(`<span class="hl">Welcome to <span class="acc">naman@portfolio</span></span>
type <span class="acc">help</span> to see what you can do. <span class="muted">(or click a chip below.)</span>
<span class="muted">easter eggs: try <span class="acc">snake</span>, <span class="acc">cmatrix</span>, <span class="acc">fortune</span>, <span class="acc">music</span>.</span>`);
    }
  }, [open]);

  return (
    <div
      className={`palette-root${open ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Command terminal"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="palette">
        <div className="palette-head">
          <div className="lights" aria-hidden="true">
            <span className="r" />
            <span className="y" />
            <span className="g" />
          </div>
          <div className="title">
            <span className="acc">naman</span>@portfolio — bash
          </div>
          <button className="close" type="button" onClick={close} aria-label="Close terminal">
            esc
          </button>
        </div>
        <div className="palette-body" ref={bodyRef} />
        <div className="palette-suggest">
          <span className="label"># try:</span>
          {SUGGEST_CHIPS.map((c) => (
            <button
              key={c}
              className="chip"
              type="button"
              onClick={() => {
                setValue(c);
                submit(c);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <form
          className="palette-input-row"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <span className="lead">
            <span className="u">naman</span>
            <span style={{ color: "var(--fg-4)" }}>@</span>
            <span className="at">portfolio</span>
            <span style={{ color: "var(--fg-4)" }}>:</span>
            <span className="cwd">~</span>
            <span className="d">$</span>
          </span>
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="command"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                if (historyRef.current.length === 0) return;
                e.preventDefault();
                histIdxRef.current = Math.max(
                  0,
                  (histIdxRef.current === -1 ? historyRef.current.length : histIdxRef.current) - 1,
                );
                setValue(historyRef.current[histIdxRef.current] ?? "");
              } else if (e.key === "ArrowDown") {
                if (histIdxRef.current === -1) return;
                e.preventDefault();
                histIdxRef.current = Math.min(historyRef.current.length, histIdxRef.current + 1);
                setValue(
                  histIdxRef.current === historyRef.current.length
                    ? ""
                    : historyRef.current[histIdxRef.current] ?? "",
                );
              } else if (e.key === "Tab") {
                e.preventDefault();
                tabComplete();
              } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
                e.preventDefault();
                if (bodyRef.current) bodyRef.current.innerHTML = "";
              }
            }}
          />
        </form>
      </div>
    </div>
  );
}
