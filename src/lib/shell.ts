import { ACCENT_PALETTES, FORTUNES, escapeHTML, type AccentName } from "./commands";
import {
  allNames,
  cwdLabel,
  findProject,
  nodeAt,
  resolve,
  type Cwd,
  type FsNode,
} from "./fs";
import { SITE } from "./site";
import { isMusicPlaying, playMusic, stopMusic } from "./music";

/**
 * The shell engine, lifted out of CommandPalette so the hero prompt and the ⌘K
 * overlay can drive one session instead of two. The engine owns no DOM and no
 * React state — it writes through `emit` and lets the caller decide where the
 * lines land.
 */
export interface ShellContext {
  /** Append one output block. `cls` lands on the wrapper alongside `echo`. */
  emit: (html: string, cls?: string) => void;
  /** Wipe the scrollback (`clear`, Ctrl-L). */
  clear: () => void;
  /** Ask the host surface to dismiss itself — a no-op for the inline hero. */
  requestClose: () => void;
  /**
   * Last stop before `command not found`. Return true to claim the input.
   *
   * This is where the RAG responder plugs in: hand `raw` to the retriever,
   * emit a pending line, and resolve it asynchronously. Nothing else in the
   * engine has to change.
   */
  onUnknown?: (raw: string, cmd: string, args: string[]) => boolean | void;
  /** Working directory changed — the prompt re-renders. */
  onCwdChange?: (cwd: Cwd) => void;
  /** Open a project's deep-dive modal. */
  openProject?: (name: string) => void;
}

export interface Shell {
  run: (raw: string) => void;
  /** Tab completion. Returns the completed string, or null if it printed candidates. */
  complete: (partial: string) => string | null;
  cwd: () => Cwd;
}

/** `goto` scrolls the page. `cd` walks the filesystem — they're different verbs. */
const NAV_TARGETS: Record<string, string> = {
  about: "#about",
  work: "#work",
  projects: "#work",
  experience: "#experience",
  stats: "#stats",
  hackathons: "#hackathons",
  skills: "#skills",
  blogs: "#blogs",
  contact: "#contact",
  top: "#top",
  "": "#top",
  "~": "#top",
};

/** Named external destinations that aren't files in the tree. */
const LINK_TARGETS: Record<string, string> = {
  github: SITE.github,
  linkedin: SITE.linkedin,
  site: SITE.url,
  portfolio: SITE.url,
  formstr: "https://formstr.app",
  resume: SITE.resumePath,
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

/** Extra tab-complete candidates that aren't command names. */
const COMPLETION_NOUNS = [...new Set([...allNames(), ...Object.keys(LINK_TARGETS)])];

function currentAccent(): AccentName {
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
}

export function createShell(ctx: ShellContext): Shell {
  const { emit, clear, requestClose } = ctx;

  let cwd: Cwd = [];
  let prevCwd: Cwd = [];

  const setCwd = (next: Cwd) => {
    prevCwd = cwd;
    cwd = next;
    ctx.onCwdChange?.(cwd);
  };

  /** `ls` row: name (dir gets a trailing slash + accent), then description. */
  const listing = (children: FsNode[]): string => {
    const rows = children.map((c) => {
      const label =
        c.type === "dir"
          ? `<span class="acc">${c.name}/</span>`
          : `<span class="hl">${c.name}</span>`;
      return `<tr><td>${label}</td><td class="muted">${c.desc ?? ""}</td></tr>`;
    });
    return `<table>${rows.join("")}</table>`;
  };

  const noSuch = (cmd: string, arg: string) =>
    emit(
      `<span class="err">${cmd}: ${escapeHTML(arg)}: No such file or directory</span>`,
    );

  const COMMANDS: Record<string, (args: string[]) => void> = {
    help: () =>
      emit(`<span class="hl">Available commands</span>
<table>
  <tr><td>help</td><td>show this list</td></tr>
  <tr><td>whoami</td><td>quick intro</td></tr>
  <tr><td>about</td><td>full bio</td></tr>
  <tr><td>ls [path]</td><td>list the current directory</td></tr>
  <tr><td>cd &lt;path&gt;</td><td>change directory · <span class="muted">.. — ~ all work</span></td></tr>
  <tr><td>pwd</td><td>print working directory</td></tr>
  <tr><td>tree [path]</td><td>show the whole tree</td></tr>
  <tr><td>cat &lt;file&gt;</td><td>read a file</td></tr>
  <tr><td>view &lt;project&gt;</td><td>open a project's full deep dive</td></tr>
  <tr><td>open &lt;name&gt;</td><td>open a link in a new tab</td></tr>
  <tr><td>goto &lt;section&gt;</td><td>scroll the page to a section</td></tr>
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
  <tr><td>exit</td><td>close the overlay</td></tr>
</table>
<span class="muted"># shortcuts: ⌘K fullscreen · Esc close · ↑/↓ history · Tab complete · j/k scroll page</span>`),

    whoami: () =>
      emit(`<span class="hl">Naman Khandelwal</span>
3rd year CS @ <span class="acc">IIIT Lucknow</span> · GPA 8.90
Currently: <span class="acc">Summer of Bitcoin</span> intern @ Formstr
Expert on CF · 4★ on CodeChef · Knight on LeetCode · Google CTF rank 146`),

    about: () => COMMANDS.cat(["~/about.md"]),

    pwd: () => emit(cwdLabel(cwd)),

    ls: (args) => {
      const target = args.find((a) => !a.startsWith("-")) ?? "";
      const found = resolve(cwd, target);
      if (!found) return noSuch("ls", target);
      if (found.node.type === "file") {
        // Listing a file prints the file, like `ls -l` naming it.
        return emit(
          `<span class="hl">${found.node.name}</span> <span class="muted">${found.node.desc ?? ""}</span>`,
        );
      }
      const kids = found.node.children ?? [];
      if (kids.length === 0) return emit(`<span class="muted"># empty</span>`);
      emit(listing(kids));
    },

    cd: (args) => {
      // Bare `cd` goes home, like a real shell.
      const target = args[0] ?? "~";
      if (target === "-") {
        const back = prevCwd;
        setCwd(back);
        return emit(`<span class="ok">${cwdLabel(cwd)}</span>`);
      }
      const found = resolve(cwd, target);
      if (!found) {
        return emit(`<span class="err">cd: ${escapeHTML(target)}: No such file or directory</span>`);
      }
      if (found.node.type !== "dir") {
        return emit(`<span class="err">cd: ${escapeHTML(target)}: Not a directory</span>`);
      }
      setCwd(found.path);
      const kids = found.node.children ?? [];
      emit(
        `<span class="ok">${cwdLabel(cwd)}</span> <span class="muted">· ${kids.length} ${kids.length === 1 ? "entry" : "entries"}</span>\n` +
          listing(kids),
      );
    },

    cat: (args) => {
      const target = args[0] ?? "";
      if (!target) {
        return emit(
          `<span class="err">cat: missing file operand</span>\n<span class="muted"># try: cat about.md</span>`,
        );
      }
      const found = resolve(cwd, target);
      if (!found) return noSuch("cat", target);
      if (found.node.type === "dir") {
        return emit(
          `<span class="err">cat: ${escapeHTML(target)}: Is a directory</span>\n<span class="muted"># try: ls ${escapeHTML(target)}</span>`,
        );
      }
      emit(found.node.body?.() ?? `<span class="muted"># empty file</span>`);
    },

    tree: (args) => {
      const found = resolve(cwd, args[0] ?? "");
      if (!found) return noSuch("tree", args[0] ?? "");
      const out: string[] = [`<span class="acc">${cwdLabel(found.path)}</span>`];
      const walk = (node: FsNode, prefix: string) => {
        const kids = node.children ?? [];
        kids.forEach((c, i) => {
          const last = i === kids.length - 1;
          const label =
            c.type === "dir" ? `<span class="acc">${c.name}/</span>` : `<span class="hl">${c.name}</span>`;
          out.push(`<span class="muted">${prefix}${last ? "└── " : "├── "}</span>${label}`);
          if (c.type === "dir") walk(c, prefix + (last ? "    " : "│   "));
        });
      };
      walk(found.node, "");
      emit(out.join("\n"));
    },

    /** Deep dive — opens the same modal the Projects section opens. */
    view: (args) => {
      const arg = args[0] ?? "";
      if (!arg) {
        return emit(
          `<span class="err">view: missing argument</span>\n<span class="muted"># try: view trequila · view skillswap · view lockin</span>`,
        );
      }
      // `view .` inside a project dir views that project.
      const name =
        arg === "." && cwd[0] === "projects" && cwd[1] ? cwd[1] : arg.replace(/\/$/, "");
      const project = findProject(name);
      if (!project) {
        return emit(
          `<span class="err">view: '${escapeHTML(arg)}' is not a project.</span>\n<span class="muted"># projects: trequila, skillswap, lockin · hackathons live in ~/hackathons</span>`,
        );
      }
      ctx.openProject?.(project.name);
      emit(
        `<span class="ok">→ opening deep dive</span> <span class="muted">· ${project.name} — ${project.deepDive.tagline}</span>`,
      );
      window.setTimeout(requestClose, 350);
    },

    /** Scroll the page. `cd` walks the filesystem; these are different verbs. */
    goto: (args) => {
      const t = (args[0] ?? "").replace(/^[~/]+/, "").replace(/\/$/, "").toLowerCase();
      if (t in NAV_TARGETS) {
        document.querySelector(NAV_TARGETS[t])?.scrollIntoView({ behavior: "smooth" });
        emit(`<span class="ok">→ ${t || "top"}</span>`);
        window.setTimeout(requestClose, 400);
        return;
      }
      emit(
        `<span class="err">goto: ${escapeHTML(args[0] ?? "")}: no such section</span>\n<span class="muted"># ${Object.keys(NAV_TARGETS).filter(Boolean).filter((k) => k !== "~").join(" · ")}</span>`,
      );
    },

    open: (args) => {
      const arg = args[0] ?? "";
      if (!arg) {
        return emit(
          `<span class="err">open: missing argument</span>\n<span class="muted"># try: open trequila · open github · open resume</span>`,
        );
      }
      const key = arg.toLowerCase().replace(/\/$/, "");

      // 1. named external destinations
      let url: string | undefined = LINK_TARGETS[key];

      // 2. a node in the tree that carries a url (project, blog, resume)
      if (!url) {
        const found = resolve(cwd, arg);
        if (found?.node.url) url = found.node.url;
      }

      // 3. a project by name or alias, from anywhere
      if (!url) {
        const project = findProject(key);
        if (project) url = project.links.live ?? project.links.source;
      }

      // 4. a blog by bare name (`open nextauth`)
      if (!url) {
        const blogs = nodeAt(["blogs"])?.children ?? [];
        const hit = blogs.find(
          (b) => b.name === key || b.name.replace(/\.md$/, "") === key,
        );
        if (hit?.url) url = hit.url;
      }

      if (!url) {
        return emit(
          `<span class="err">open: '${escapeHTML(arg)}' not found.</span>\n<span class="muted"># try: trequila · nextauth · github · linkedin · resume · formstr</span>`,
        );
      }
      window.open(url, "_blank", "noopener");
      emit(`<span class="ok">→ opening ${escapeHTML(key)}</span> <span class="muted">(${url})</span>`);
    },


    email: () => {
      const e = SITE.email;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(e)
          .then(() =>
            emit(`<span class="ok">✔ copied to clipboard</span> <a href="mailto:${e}">${e}</a>`),
          )
          .catch(() => emit(`<a href="mailto:${e}">${e}</a>`));
      } else {
        emit(`<a href="mailto:${e}">${e}</a>`);
      }
    },

    socials: () =>
      emit(`<table>
<tr><td>github</td><td><a href="${SITE.github}" target="_blank" rel="noopener">github.com/${SITE.githubHandle}</a></td></tr>
<tr><td>linkedin</td><td><a href="${SITE.linkedin}" target="_blank" rel="noopener">in/naman-khandelwal</a></td></tr>
<tr><td>site</td><td><a href="${SITE.url}" target="_blank" rel="noopener">namankhandelwal.dev</a></td></tr>
<tr><td>email</td><td><a href="mailto:${SITE.email}">${SITE.email}</a></td></tr>
</table>`),

    // Tiered exactly like the Stats section: s (placements) → a (rating) → b (rounds).
    achievements: () => COMMANDS.cat(["~/achievements.log"]),

    resume: () => {
      emit(
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
        const cur = currentAccent();
        next = names[(names.indexOf(cur) + 1) % names.length];
      }
      window.dispatchEvent(new CustomEvent("nk:open-tweaks", { detail: { accent: next } }));
      emit(
        `<span class="ok">→ theme: <span class="hl">${next}</span></span> <span class="muted">(${ACCENT_PALETTES[next].accent})</span>`,
      );
    },

    tweaks: () => {
      window.dispatchEvent(new Event("nk:open-tweaks"));
      emit(`<span class="ok">→ tweaks panel opened</span>`);
      window.setTimeout(requestClose, 400);
    },

    fortune: () => {
      const q = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      emit(`<span class="muted">┌─── fortune ───┐</span>
  ${q}
<span class="muted">└───────────────┘</span>`);
    },

    cmatrix: () => {
      emit(`<span class="ok">→ entering the matrix</span> <span class="muted">(press any key to exit)</span>`);
      window.setTimeout(() => {
        requestClose();
        window.dispatchEvent(new Event("nk:open-matrix"));
      }, 300);
    },

    matrix: () => COMMANDS.cmatrix([]),

    music: (args) => {
      const arg = (args[0] || "").toLowerCase();
      if (arg === "off" || arg === "stop" || (isMusicPlaying() && !arg)) {
        stopMusic();
        emit(`<span class="muted">♪ music: off</span>`);
      } else {
        playMusic();
        emit(`<span class="ok">♪ music: on</span> <span class="muted">(chiptune — auto-stops after a bit)</span>`);
      }
    },

    play: (args) => COMMANDS.music(args),

    snake: () => {
      emit(`<span class="ok">→ launching snake.exe</span> <span class="muted">(arrows or hjkl)</span>`);
      window.setTimeout(() => {
        requestClose();
        window.dispatchEvent(new Event("nk:open-snake"));
      }, 300);
    },

    date: () => emit(`<span class="hl">${escapeHTML(new Date().toString())}</span>`),
    echo: (args) => emit(escapeHTML(args.join(" "))),
    clear: () => clear(),
    exit: () => {
      emit(`<span class="muted"># bye.</span>`);
      window.setTimeout(requestClose, 300);
    },
    bye: () => COMMANDS.exit([]),

    sudo: (args) => {
      const sub = args.join(" ").trim().toLowerCase();
      if (!sub) {
        return emit(
          `<span class="err">usage: sudo &lt;command&gt;</span>\n<span class="muted">try: <span class="acc">sudo hire naman</span></span>`,
        );
      }
      if (sub === "hire naman" || sub === "hire" || sub === "hire-naman" || sub === "hire_naman") {
        emit(`<span class="warn">[sudo] password for recruiter:</span> <span class="muted">**********</span>`);
        window.setTimeout(() => emit(`<span class="ok">✓ authentication successful</span>`), 850);
        window.setTimeout(
          () => emit(`<span class="ok">✓ access granted</span> <span class="muted">· redirecting to resume…</span>`),
          1550,
        );
        window.setTimeout(() => window.open(SITE.resumePath, "_blank", "noopener"), 2100);
        return;
      }
      if (sub.startsWith("rm -rf")) {
        return emit(`<span class="err">rm: it is dangerous to operate recursively on '/'</span>
<span class="err">rm: use --no-preserve-root to override this failsafe</span>
<span class="muted"># nice try.</span>`);
      }
      if (sub === "make me a sandwich" || sub === "make sandwich") {
        return emit(`<span class="ok">okay.</span> <span class="muted">🥪 (we don't do emoji on this site, but — here)</span>`);
      }
      if (sub === "shutdown" || sub === "reboot" || sub === "halt" || sub === "poweroff") {
        emit(`<span class="warn">[sudo] password for naman:</span> <span class="muted">**********</span>`);
        window.setTimeout(
          () => emit(`<span class="err">permission denied. this terminal cannot be killed.</span>`),
          700,
        );
        return;
      }
      emit(`<span class="err">[sudo] password for naman:</span>
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
      const themeName = currentAccent();
      const colorBar =
        '<span style="color:#7B61FF">███</span>' +
        '<span style="color:#56D2D6">███</span>' +
        '<span style="color:#6CE5B2">███</span>' +
        '<span style="color:#F0C674">███</span>' +
        '<span style="color:#FF7AA6">███</span>' +
        '<span style="color:#FF6B6B">███</span>' +
        '<span style="color:#f0ede8">███</span>' +
        '<span style="color:#888">███</span>';
      emit(
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

    uptime: () =>
      emit(`up · 1 user, load average: 0.42, 0.69, 1.00\n<span class="muted"># session started on page load.</span>`),
    vim: () => emit(`<span class="err">error: vim is not installed. use j/k to scroll the page instead.</span>`),
    emacs: () => emit(`<span class="err">just kidding. type 'help'.</span>`),
    rm: () => emit(`<span class="err">rm: refusing to delete me, the developer. try 'help' instead.</span>`),
    nvim: () =>
      emit(`<span class="muted">type <span class="acc">:q!</span> &mdash; oh wait, you can't escape vim. (use 'exit')</span>`),
    hello: () => emit(`<span class="ok">hello there 👋 type 'help' to begin.</span>`),
    hi: () => COMMANDS.hello([]),
    hey: () => COMMANDS.hello([]),
  };

  const run = (raw: string) => {
    const aliased = ALIAS[raw.toLowerCase()] ?? raw;
    const tokens = aliased.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);
    if (cmd in COMMANDS) {
      try {
        COMMANDS[cmd](args);
      } catch (err) {
        emit(`<span class="err">runtime error: ${escapeHTML(String(err))}</span>`);
      }
      return;
    }
    if (ctx.onUnknown?.(raw, cmd, args) === true) return;
    emit(
      `<span class="err">bash: ${escapeHTML(cmd)}: command not found</span>\n<span class="muted"># type 'help' for available commands.</span>`,
    );
  };

  const complete = (partial: string): string | null => {
    if (!partial.trim()) return null;
    const parts = partial.split(/\s+/);
    const head = parts.slice(0, -1);
    const frag = parts[parts.length - 1];

    // First token completes commands; later tokens complete paths in the cwd.
    let names: string[];
    if (head.length === 0) {
      names = Object.keys(COMMANDS);
    } else {
      const here = nodeAt(cwd)?.children?.map((c) => (c.type === "dir" ? `${c.name}/` : c.name)) ?? [];
      names = [...new Set([...here, ...COMPLETION_NOUNS])];
    }

    const match = names.filter((n) => n.startsWith(frag));
    if (match.length === 1) {
      const done = match[0];
      // Directories complete to `dir/` without a trailing space, so you can keep typing.
      return [...head, done].join(" ") + (done.endsWith("/") ? "" : " ");
    }
    if (match.length > 1) emit(`<span class="muted">${match.join("   ")}</span>`);
    return null;
  };

  return { run, complete, cwd: () => cwd };
}
