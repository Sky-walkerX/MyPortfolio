import {
  ACHIEVEMENTS,
  BLOGS,
  EXPERIENCES,
  HACKATHONS,
  PROJECTS,
  SKILLS,
  type Project,
} from "./data";
import { SITE } from "./site";

/**
 * A real-ish filesystem for the terminal, derived entirely from data.ts so it
 * can never drift from the rendered site. `cd` walks this tree; it does not
 * scroll the page (that's `goto`).
 */
export interface FsNode {
  name: string;
  type: "dir" | "file";
  /** Right-hand column in `ls -l`-ish listings. */
  desc?: string;
  children?: FsNode[];
  /** `cat` output — already terminal HTML. */
  body?: () => string;
  /** Project dirs carry the record so `view` can open the real deep-dive. */
  project?: Project;
  /** `open` target for this node. */
  url?: string;
  /** Section anchor, for `goto`. */
  section?: string;
}

/**
 * data.ts bullets carry site markup. `<strong>` is the site's emphasis; the
 * terminal's is `.hl`. Everything else (`.acc`, `.hl`) already matches.
 */
export function fromDataHtml(s: string): string {
  return s
    .replace(/<strong>/g, '<span class="hl">')
    .replace(/<\/strong>/g, "</span>")
    .replace(/class='([^']*)'/g, 'class="$1"');
}

const wrap = (s: string, width = 76): string => {
  // Wrap on plain-text length while leaving tags intact.
  const words = s.split(" ");
  const lines: string[] = [];
  let line = "";
  let visible = 0;
  for (const w of words) {
    const wLen = w.replace(/<[^>]+>/g, "").length;
    if (visible + wLen + 1 > width && line) {
      lines.push(line);
      line = w;
      visible = wLen;
    } else {
      line = line ? `${line} ${w}` : w;
      visible += (line === w ? 0 : 1) + wLen;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ---------- projects ---------- */

function projectReadme(p: Project): string {
  const status =
    p.status === "live"
      ? '<span class="ok">[LIVE]</span>'
      : p.status === "wip"
        ? '<span class="warn">[WIP]</span>'
        : '<span class="muted">[ARCHIVE]</span>';
  const bullets = p.bullets
    .map((b) => `  <span class="acc">▪</span> ${wrap(fromDataHtml(b), 72).replace(/\n/g, "\n    ")}`)
    .join("\n");
  return `<span class="hl">${p.num} ./${p.name}</span> ${status}
<span class="muted">${p.deepDive.tagline}</span>

${wrap(p.description)}

<span class="hl">highlights:</span>
${bullets}

<span class="muted"># view ${p.name} — full deep dive (problem, architecture, challenges)</span>`;
}

function projectNode(p: Project): FsNode {
  return {
    name: p.name,
    type: "dir",
    desc: p.deepDive.tagline,
    project: p,
    url: p.links.live ?? p.links.source,
    children: [
      {
        name: "readme.md",
        type: "file",
        desc: "what it is · highlights",
        body: () => projectReadme(p),
      },
      {
        name: "stack.txt",
        type: "file",
        desc: `${p.tags.length} technologies`,
        body: () =>
          `<span class="hl">${p.name} · stack</span>\n\n  ` +
          p.tags.map((t) => `<span class="acc">${t}</span>`).join(", "),
      },
      {
        name: "links.txt",
        type: "file",
        desc: p.links.live ? "live + source" : "source",
        body: () =>
          `<span class="hl">${p.name} · links</span>\n\n` +
          (p.links.live
            ? `  live    <a href="${p.links.live}" target="_blank" rel="noopener">${p.links.live} ↗</a>\n`
            : "") +
          `  source  <a href="${p.links.source}" target="_blank" rel="noopener">${p.links.source} ↗</a>`,
      },
    ],
  };
}

/* ---------- achievements, tier-ordered ---------- */

const TIER_HEADS: Record<string, string> = {
  s: "national / global placements",
  a: "sustained rating",
  b: "individual rounds",
};

function achievementsLog(): string {
  const out: string[] = ['<span class="hl">~/achievements.log</span>'];
  for (const tier of ["s", "a", "b"] as const) {
    const items = ACHIEVEMENTS.filter((a) => a.tier === tier);
    if (items.length === 0) continue;
    out.push("");
    out.push(`<span class="muted">── ${TIER_HEADS[tier]} ──</span>`);
    for (const a of items) {
      const mark =
        tier === "s"
          ? '<span class="ok">★</span>'
          : tier === "a"
            ? '<span class="acc">◆</span>'
            : '<span class="muted">·</span>';
      const text = fromDataHtml(a.text);
      out.push(`  ${mark} ${wrap(text, 70).replace(/\n/g, "\n    ")}`);
    }
  }
  return out.join("\n");
}

/* ---------- tree ---------- */

const projectsDir: FsNode = {
  name: "projects",
  type: "dir",
  desc: `${PROJECTS.length} entries`,
  section: "#work",
  children: PROJECTS.map(projectNode),
};

const hackathonsDir: FsNode = {
  name: "hackathons",
  type: "dir",
  desc: `${HACKATHONS.filter((h) => !h.placeholder).length} entries`,
  section: "#hackathons",
  children: HACKATHONS.filter((h) => !h.placeholder).map((h) => ({
    name: `${slug(h.name)}.log`,
    type: "file" as const,
    desc: `${h.date} · ${h.sub.replace(/<[^>]+>/g, "").split("·")[0].trim()}`,
    body: () =>
      `<span class="hl">${h.name}</span> <span class="muted">· ${h.date}</span>\n\n  ${fromDataHtml(h.sub)}`,
  })),
};

const blogsDir: FsNode = {
  name: "blogs",
  type: "dir",
  desc: `${BLOGS.length} posts`,
  section: "#blogs",
  children: BLOGS.map((b) => {
    const file = b.meta.split("·")[1]?.trim() ?? slug(b.title) + ".md";
    return {
      name: file,
      type: "file" as const,
      desc: b.title.length > 46 ? b.title.slice(0, 44) + "…" : b.title,
      url: b.href,
      body: () =>
        `<span class="hl">${b.title}</span>\n<span class="muted">${b.tags.join(" · ")}</span>\n\n${wrap(b.description)}\n\n<a href="${b.href}" target="_blank" rel="noopener">read on medium ↗</a>\n<span class="muted"># open ${file.replace(/\.md$/, "")} — opens in a new tab</span>`,
    };
  }),
};

const skillsDir: FsNode = {
  name: "skills",
  type: "dir",
  desc: `${SKILLS.length} categories`,
  section: "#skills",
  children: SKILLS.map((s) => {
    const key = s.key.replace(/\s*=$/, "").trim();
    return {
      name: `${key}.txt`,
      type: "file" as const,
      desc: `${s.values.length} entries`,
      body: () =>
        `<span class="hl">${key}</span>\n\n  ` +
        s.values.map((v) => `<span class="acc">${v}</span>`).join(", "),
    };
  }),
};

const experienceDir: FsNode = {
  name: "experience",
  type: "dir",
  desc: `${EXPERIENCES.length} entries`,
  section: "#experience",
  // Keyed on role, not company — two entries share "Axios · IIIT Lucknow".
  children: EXPERIENCES.map((e) => ({
    name: `${slug(e.role)}.md`,
    type: "file" as const,
    desc: `${e.company} · ${e.date}`,
    body: () =>
      `<span class="hl">${e.company}</span> <span class="muted">· ${e.date}</span>\n<span class="acc">${e.role}</span>\n\n` +
      e.bullets
        .map((b) => `  <span class="acc">▪</span> ${wrap(fromDataHtml(b), 72).replace(/\n/g, "\n    ")}`)
        .join("\n"),
  })),
};

export const ROOT: FsNode = {
  name: "~",
  type: "dir",
  children: [
    {
      name: "about.md",
      type: "file",
      desc: "bio",
      section: "#about",
      body: () => `<span class="hl">~/about.md</span>

  I'm a developer who lives between web and systems — building things
  end-to-end, from React frontends down to Go services orchestrated
  over NATS JetStream.

  Right now: shipping the Formstr Super App as part of Summer of Bitcoin.
  Outside of work: competitive programming, CTFs, OSS (tauri, fedimint, Checkmate).

  Open to internships, collabs, and interesting conversations.`,
    },
    projectsDir,
    experienceDir,
    hackathonsDir,
    skillsDir,
    blogsDir,
    {
      name: "achievements.log",
      type: "file",
      desc: `${ACHIEVEMENTS.length} entries · tiered`,
      section: "#stats",
      body: achievementsLog,
    },
    {
      name: "contact.txt",
      type: "file",
      desc: "how to reach me",
      section: "#contact",
      body: () => `<span class="hl">~/contact.txt</span>

  email     <a href="mailto:${SITE.email}">${SITE.email}</a>
  github    <a href="${SITE.github}" target="_blank" rel="noopener">github.com/${SITE.githubHandle} ↗</a>
  linkedin  <a href="${SITE.linkedin}" target="_blank" rel="noopener">in/naman-khandelwal ↗</a>
  site      <a href="${SITE.url}" target="_blank" rel="noopener">${SITE.url.replace(/^https?:\/\//, "")} ↗</a>

<span class="muted"># email — copies to clipboard</span>`,
    },
    {
      name: "resume.pdf",
      type: "file",
      desc: "1 page · pdf",
      url: SITE.resumePath,
      body: () =>
        `<span class="err">cat: resume.pdf: binary file matches</span>\n<span class="muted"># try: open resume</span>`,
    },
  ],
};

/* ---------- path resolution ---------- */

export type Cwd = string[];

/** Render a cwd for the prompt: `~`, `~/projects`, … */
export function cwdLabel(cwd: Cwd): string {
  return cwd.length === 0 ? "~" : `~/${cwd.join("/")}`;
}

export function nodeAt(path: Cwd): FsNode | null {
  let node: FsNode = ROOT;
  for (const seg of path) {
    if (node.type !== "dir" || !node.children) return null;
    const next = node.children.find((c) => c.name === seg);
    if (!next) return null;
    node = next;
  }
  return node;
}

/**
 * Resolve `arg` against `cwd`, unix-style. Returns null for paths that escape
 * the tree or don't exist; `..` above home clamps to home like a chroot.
 */
export function resolve(cwd: Cwd, arg: string): { path: Cwd; node: FsNode } | null {
  let segs: string[];
  const cleaned = arg.trim();

  if (cleaned === "") {
    // No operand means "here" — `ls` lists the cwd. (`cd` passes "~" for home.)
    segs = [...cwd];
  } else if (cleaned === "~" || cleaned === "/" || cleaned === "~/") {
    segs = [];
  } else if (cleaned.startsWith("~/") || cleaned.startsWith("/")) {
    segs = cleaned.replace(/^~?\//, "").split("/");
  } else {
    segs = [...cwd, ...cleaned.split("/")];
  }

  const out: string[] = [];
  for (const s of segs) {
    if (s === "" || s === ".") continue;
    if (s === "..") {
      out.pop();
      continue;
    }
    out.push(s);
  }

  const node = nodeAt(out);
  return node ? { path: out, node } : null;
}

export interface MountEntry {
  path: string;
  count: number;
  note: string;
}

/**
 * The boot sequence mounts this. Counts are read from the tree, so the boot
 * can never announce a directory the shell doesn't actually have.
 */
export function mountTable(): MountEntry[] {
  const kids = ROOT.children ?? [];
  const dirs = kids.filter((c) => c.type === "dir");
  const entries: MountEntry[] = [
    { path: "~/", count: kids.length, note: "home" },
  ];
  for (const d of dirs) {
    const names = (d.children ?? []).map((c) => c.name.replace(/\.(md|txt|log)$/, ""));
    // Keep the note to one readable clause — some names (role slugs) are long.
    let note = "";
    let shown = 0;
    for (const n of names) {
      const next = note ? `${note}, ${n}` : n;
      if (next.length > 38) break;
      note = next;
      shown++;
    }
    if (shown < names.length) note = note ? `${note}, +${names.length - shown}` : `${names.length} entries`;
    entries.push({ path: `~/${d.name}`, count: names.length, note });
  }
  const log = kids.find((c) => c.name === "achievements.log");
  if (log) {
    entries.push({
      path: "achievements.log",
      count: ACHIEVEMENTS.length,
      note: "tiered s · a · b",
    });
  }
  return entries;
}

/** Every path in the tree, for tab completion. */
export function allNames(): string[] {
  const names: string[] = [];
  const walk = (n: FsNode) => {
    if (n !== ROOT) names.push(n.name);
    n.children?.forEach(walk);
  };
  walk(ROOT);
  return names;
}

/** Find a project by name or alias, anywhere in the tree. */
export function findProject(name: string): Project | null {
  const key = name.toLowerCase().replace(/^\.\//, "").replace(/\/$/, "");
  const alias: Record<string, string> = {
    t: "trequila",
    travel: "trequila",
    ss: "skillswap",
    sk: "skillswap",
    swap: "skillswap",
    li: "lockin",
    lock: "lockin",
    study: "lockin",
  };
  const target = alias[key] ?? key;
  return PROJECTS.find((p) => p.name === target) ?? null;
}
