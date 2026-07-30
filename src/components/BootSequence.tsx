"use client";

import { useEffect, useRef, useState } from "react";
import { mountTable } from "@/lib/fs";
import { SITE } from "@/lib/site";

/** Live values from `loadStats()`, threaded down from the server page. */
export interface BootStats {
  githubContributions: number | null;
  cfRating: number | null;
  cfRank: string | null;
}

interface BootLine {
  /** Delay before this line prints, in ms. */
  d: number;
  /** Left-hand label — `mount ~/projects`, `fetch github.com/...`. */
  left: string;
  /** Numeric column, right-aligned so the digits line up down the table. */
  num?: string;
  /** Trailing detail. */
  note?: string;
}

const BOOT_INITIAL_DELAY = 300;
const BOOT_HOLD_AFTER = 520;

/**
 * The boot mounts the filesystem the terminal actually walks — every path and
 * count comes from `fs.ts`, so it can't announce something `cd` would then
 * fail to find. Real numbers throughout; exactly one joke, at the end.
 */
function buildSequence(stats: BootStats): BootLine[] {
  const lines: BootLine[] = [
    {
      d: 300,
      left: `<span class="acc">[boot]</span> mounting filesystem`,
      note: `<span class="mute">portfolio v2.0 · next.js 16</span>`,
    },
  ];

  for (const m of mountTable()) {
    lines.push({
      d: 245,
      left: `<span class="ok">mount</span>  <span class="acc">${m.path}</span>`,
      num: `<span class="hl">${m.count}</span>`,
      note: `<span class="mute">${m.note}</span>`,
    });
  }

  // Live fetches — the two things the site genuinely retrieves at build time.
  const gh = stats.githubContributions;
  lines.push({
    d: 355,
    left: `<span class="mute">fetch</span>  github.com/${SITE.githubHandle}`,
    num: gh !== null ? `<span class="ok">200</span>` : `<span class="warn">—</span>`,
    note:
      gh !== null
        ? `<span class="hl">${gh.toLocaleString()}</span><span class="mute"> contributions · 6mo</span>`
        : `<span class="mute">offline · using cached counts</span>`,
  });

  const rating = stats.cfRating;
  lines.push({
    d: 355,
    left: `<span class="mute">fetch</span>  codeforces.com/${SITE.cfHandle}`,
    num: rating !== null ? `<span class="ok">200</span>` : `<span class="warn">—</span>`,
    note:
      rating !== null
        ? `<span class="cy">${stats.cfRank ?? "Expert"}</span><span class="mute"> · peak </span><span class="hl">${rating}</span>`
        : `<span class="mute">offline · using cached rating</span>`,
  });

  lines.push({
    d: 360,
    left: `<span class="ok">[ ok ]</span> filesystem ready`,
    note: `<span class="mute">0 errors · bash 5.2 · 40 commands</span>`,
  });

  // The one gag.
  lines.push({
    d: 470,
    left: `<span class="warn">[ ⚠ ]</span> <span class="mute">fsck: found 1 unfinished side project. ignoring.</span>`,
  });

  lines.push({
    d: 300,
    left: `<span class="acc">naman@portfolio</span><span class="mute">:</span><span class="cy">~</span><span class="hl">$</span> <span class="boot-cur"></span>`,
  });

  return lines;
}

export function BootSequence({ stats }: { stats: BootStats }) {
  const linesRef = useRef<HTMLDivElement | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const reduced =
      document.body.getAttribute("data-motion") === "off" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      document.body.setAttribute("data-boot", "done");
      return;
    }

    const SEQ = buildSequence(stats);
    let done = false;
    let i = 0;
    let timeoutId: number | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      setClosing(true);
      window.setTimeout(() => {
        document.body.setAttribute("data-boot", "done");
      }, 460);
    };

    const emit = () => {
      if (done) return;
      if (i >= SEQ.length) {
        timeoutId = window.setTimeout(finish, BOOT_HOLD_AFTER);
        return;
      }
      const item = SEQ[i++];
      const el = document.createElement("div");
      el.className = "ln";
      // Exactly two children so the flex row has a real left and right column.
      el.innerHTML =
        `<span class="bl">${item.left}</span>` +
        `<span class="bn">${item.num ?? ""}</span>` +
        `<span class="bv">${item.note ?? ""}</span>`;
      linesRef.current?.appendChild(el);
      timeoutId = window.setTimeout(emit, item.d);
    };

    /**
     * Any input skips. If it was a printable keystroke, hand the character to
     * the hero prompt rather than eating it — someone who starts typing
     * `help` during the boot lands in the prompt with `h` already there.
     */
    const onKey = (e: KeyboardEvent) => {
      if (!done && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && e.key !== "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("nk:boot-seed", { detail: { key: e.key } }));
      }
      finish();
    };
    const onPointer = () => finish();

    window.addEventListener("keydown", onKey, true);
    window.addEventListener("click", onPointer, true);
    window.addEventListener("touchstart", onPointer, true);

    timeoutId = window.setTimeout(emit, BOOT_INITIAL_DELAY);

    return () => {
      done = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("click", onPointer, true);
      window.removeEventListener("touchstart", onPointer, true);
    };
  }, [stats]);

  return (
    <div className={`boot-root${closing ? " closing" : ""}`} id="bootRoot" aria-hidden="true">
      <div className="boot-screen">
        <pre className="boot-banner" aria-hidden="true">
          {`  ███╗   ██╗██╗  ██╗
  ████╗  ██║██║ ██╔╝
  ██╔██╗ ██║█████╔╝
  ██║╚██╗██║██╔═██╗
  ██║ ╚████║██║  ██╗
  ╚═╝  ╚═══╝╚═╝  ╚═╝`}
        </pre>
        <div className="boot-lines" ref={linesRef} />
        <p className="boot-skip">
          <span className="key">[ press any key to skip ]</span>
        </p>
      </div>
    </div>
  );
}
