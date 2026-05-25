"use client";

import { useEffect, useRef, useState } from "react";

interface BootLine {
  d: number;
  html: string;
}

const BOOT_SEQ: BootLine[] = [
  { d: 160, html: '<span class="acc">[boot]</span> portfolio kernel v2.0 <span class="mute">· build #2026.05.25</span>' },
  { d: 220, html: '<span class="ok">[ ok ]</span> initializing core <span class="mute">· cpu: caffeine</span>' },
  { d: 240, html: '<span class="ok">[ ok ]</span> mounting <span class="acc">/home/naman</span>' },
  { d: 240, html: '<span class="ok">[ ok ]</span> mounting <span class="acc">/projects /skills /blogs /hackathons</span>' },
  { d: 260, html: '<span class="ok">[ ok ]</span> loading shell <span class="mute">(jetbrains-mono, dark-violet theme)</span>' },
  { d: 280, html: '<span class="ok">[ ok ]</span> connecting → <span class="acc">github.com</span> <span class="mute">latency: 47ms</span>' },
  { d: 280, html: '<span class="ok">[ ok ]</span> connecting → <span class="acc">codeforces.com</span> <span class="mute">latency: 112ms</span>' },
  { d: 260, html: '<span class="ok">[ ok ]</span> connecting → <span class="acc">leetcode.com</span> <span class="mute">latency: 89ms</span>' },
  { d: 260, html: '<span class="ok">[ ok ]</span> starting terminal session <span class="mute">pid 2026</span>' },
  { d: 280, html: '<span class="warn">[ ⚠ ]</span> caffeine reserves at 92% <span class="mute">(within tolerance)</span>' },
  { d: 240, html: '<span class="ok">[ ok ]</span> loading projects · hackathons · blogs' },
  { d: 260, html: '<span class="ok">[ ok ]</span> all systems nominal' },
  { d: 380, html: '<span class="acc pulse">&gt;&gt; welcome.</span>' },
];

const BOOT_INITIAL_DELAY = 480;
const BOOT_HOLD_AFTER = 760;

export function BootSequence() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const linesRef = useRef<HTMLDivElement | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const motion = document.body.getAttribute("data-motion") !== "off";

    if (!motion) {
      document.body.setAttribute("data-boot", "done");
      return;
    }

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
      }, 480);
    };

    const emit = () => {
      if (done) return;
      if (i >= BOOT_SEQ.length) {
        // hold the completed screen briefly before fading out
        timeoutId = window.setTimeout(finish, BOOT_HOLD_AFTER);
        return;
      }
      const item = BOOT_SEQ[i++];
      const el = document.createElement("div");
      el.className = "ln";
      el.innerHTML = item.html;
      linesRef.current?.appendChild(el);
      timeoutId = window.setTimeout(emit, item.d);
    };

    const skip = () => {
      finish();
    };

    window.addEventListener("keydown", skip, true);
    window.addEventListener("click", skip, true);
    window.addEventListener("touchstart", skip, true);

    timeoutId = window.setTimeout(emit, BOOT_INITIAL_DELAY);

    return () => {
      done = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.removeEventListener("keydown", skip, true);
      window.removeEventListener("click", skip, true);
      window.removeEventListener("touchstart", skip, true);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`boot-root${closing ? " closing" : ""}`}
      id="bootRoot"
      aria-hidden="true"
    >
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
