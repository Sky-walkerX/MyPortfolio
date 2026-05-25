"use client";

import { useEffect, useRef } from "react";
import type { HeatmapData } from "@/lib/stats";

interface HeatmapProps {
  data: HeatmapData;
  source: "github" | "codeforces";
  label: string;
}

export function Heatmap({ data, source, label }: HeatmapProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!tipRef.current) {
      const t = document.createElement("div");
      t.className = "heatmap-tooltip";
      document.body.appendChild(t);
      tipRef.current = t;
    }
    return () => {
      if (tipRef.current?.parentNode) tipRef.current.parentNode.removeChild(tipRef.current);
      tipRef.current = null;
    };
  }, []);

  if (data.status !== "ok") {
    return (
      <div className="heatmap" data-source={source}>
        <div className="heatmap-status">
          {data.status === "offline" ? (
            <>
              <span className="err">offline</span> — heatmap loads with internet
            </>
          ) : (
            "no activity in last 6 months"
          )}
        </div>
      </div>
    );
  }

  const onEnter = (date: string, count: number) => (e: React.MouseEvent) => {
    const tip = tipRef.current;
    if (!tip) return;
    const human = new Date(date + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    tip.textContent = `${count} ${label} · ${human}`;
    tip.classList.add("show");
    tip.style.left = e.clientX + 12 + "px";
    tip.style.top = e.clientY + 12 + "px";
  };

  const onMove = (e: React.MouseEvent) => {
    const tip = tipRef.current;
    if (!tip) return;
    tip.style.left = e.clientX + 12 + "px";
    tip.style.top = e.clientY + 12 + "px";
  };

  const onLeave = () => tipRef.current?.classList.remove("show");

  return (
    <div className="heatmap" data-source={source} ref={ref}>
      {data.cells.map((c) => (
        <span
          key={c.date}
          className="cell"
          data-l={c.level > 0 ? c.level : undefined}
          data-date={c.date}
          data-count={c.count}
          onMouseEnter={onEnter(c.date, c.count)}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        />
      ))}
    </div>
  );
}
