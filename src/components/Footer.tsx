"use client";

import { useEffect, useState } from "react";
import { Prompt } from "./Prompt";

function formatUptime(ms: number) {
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function Footer() {
  const [uptime, setUptime] = useState("00:00:00");

  useEffect(() => {
    const start = Date.now();
    const tick = () => setUptime(formatUptime(Date.now() - start));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer>
      <div className="line">
        <Prompt />
        <span className="cmd">exit</span>
      </div>
      <p className="credit">
        # Connection to <span className="acc">naman@portfolio</span> closed. <span style={{ color: "var(--fg-4)" }}>·</span>{" "}
        session uptime <span style={{ color: "var(--accent)" }}>{uptime}</span>{" "}
        <span style={{ color: "var(--fg-4)" }}>·</span> built &amp; designed by Naman Khandelwal · 2026
      </p>
    </footer>
  );
}
