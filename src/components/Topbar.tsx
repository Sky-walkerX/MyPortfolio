"use client";

import { useEffect, useState } from "react";

function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function Topbar() {
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    const start = Date.now();
    const tick = () => setUptime(formatUptime(Date.now() - start));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const openPalette = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("nk:open-palette"));
  };

  const openTweaks = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("nk:open-tweaks"));
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="lights" aria-hidden="true">
          <span className="r" />
          <span className="y" />
          <span className="g" />
        </div>
        <div className="path">
          <span className="at">naman</span>
          <span className="c">@</span>
          <span className="hide-sm">portfolio</span>
          <span className="colon">:</span>
          <span className="cwd">~</span>
        </div>
        <nav className="topnav">
          <a href="#about" className="hide-sm">
            ~/about
          </a>
          <a href="#work" className="hide-sm">
            ~/work
          </a>
          <a href="#blogs" className="hide-sm">
            ~/blogs
          </a>
          <a href="#contact" className="hide-sm">
            ~/contact
          </a>
          <span className="uptime hide-sm" title="session uptime">
            uptime <span>{uptime}</span>
          </span>
          <a
            href="#"
            onClick={openTweaks}
            className="k gear"
            aria-label="Open tweaks panel"
            title="tweaks · theme · density"
          >
            <span>⚙</span>
          </a>
          <a href="#" onClick={openPalette} className="k" aria-label="Open command palette">
            <span>⌘</span>
            <kbd>K</kbd>
          </a>
        </nav>
      </div>
    </header>
  );
}
