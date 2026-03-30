"use client";
import { useState, useEffect, useMemo, useRef } from "react";

const CF_USERNAME = "SkywalkerX";
const GH_USERNAME = "Sky-walkerX";

function getLastNDays(n) {
  const days = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0'));
  }
  return days;
}

function groupByWeeks(days) {
  const weeks = [];
  let currentWeek = [];
  const firstDay = new Date(days[0]);
  const startPad = firstDay.getDay();
  for (let i = 0; i < startPad; i++) {
    currentWeek.push(null);
  }
  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);
  return weeks;
}

function HeatmapGrid({ weeks, countMap, getColor }) {
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = useState(11);

  useEffect(() => {
    function calc() {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const numWeeks = weeks.length;
      const gap = 3;
      const size = Math.max(8, Math.floor((width - (numWeeks - 1) * gap) / numWeeks));
      setCellSize(Math.min(size, 18));
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [weeks.length]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex justify-center" style={{ gap: `${Math.max(2, cellSize > 12 ? 3 : 2)}px` }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap: `${Math.max(2, cellSize > 12 ? 3 : 2)}px` }}>
            {week.map((day, di) => {
              if (!day) return <div key={di} style={{ width: cellSize, height: cellSize }} />;
              const count = countMap[day] || 0;
              return (
                <div
                  key={di}
                  title={`${day}: ${count}`}
                  style={{ width: cellSize, height: cellSize }}
                  className={`rounded-sm ${getColor(count)} transition-colors`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function useCodeforcesHeatmap() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchCF() {
      try {
        const res = await fetch(
          `https://codeforces.com/api/user.status?handle=${encodeURIComponent(CF_USERNAME)}&from=1&count=2000`
        );
        const json = await res.json();
        if (json.status === "OK" && !cancelled) {
          const map = {};
          for (const sub of json.result) {
            if (sub.verdict === "OK") {
              const d = new Date(sub.creationTimeSeconds * 1000);
              const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
              map[dateStr] = (map[dateStr] || 0) + 1;
            }
          }
          setData(map);
        }
      } catch {
        // fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCF();
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

function useGitHubHeatmap() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchGH() {
      try {
        const res = await fetch(`https://github-contributions-api.deno.dev/${encodeURIComponent(GH_USERNAME)}.json`);
        if (res.ok && !cancelled) {
          const json = await res.json();
          const map = {};
          if (json.contributions && Array.isArray(json.contributions)) {
            for (const week of json.contributions) {
              for (const day of week) {
                if (day.date && day.contributionCount > 0) {
                  map[day.date] = day.contributionCount;
                }
              }
            }
          }
          setData(map);
        }
      } catch {
        // fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchGH();
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

function getCfColor(count) {
  if (count === 0) return "bg-white/[0.04]";
  if (count <= 2) return "bg-emerald-900/70";
  if (count <= 5) return "bg-emerald-600/80";
  if (count <= 10) return "bg-emerald-500";
  return "bg-emerald-400";
}

function getGhColor(count) {
  if (count === 0) return "bg-white/[0.04]";
  if (count <= 2) return "bg-sky-900/70";
  if (count <= 5) return "bg-sky-600/80";
  if (count <= 10) return "bg-sky-500";
  return "bg-sky-400";
}

function Legend({ colors }) {
  return (
    <div className="flex items-center gap-1.5 mt-2 text-[10px] sm:text-[11px] text-[var(--palette-light-purple)]">
      <span>Less</span>
      {colors.map((c) => (
        <div key={c} className={`w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-sm ${c}`} />
      ))}
      <span>More</span>
    </div>
  );
}

export function CodingHeatmaps() {
  const days = useMemo(() => getLastNDays(180), []);
  const weeks = useMemo(() => groupByWeeks(days), [days]);

  const cf = useCodeforcesHeatmap();
  const gh = useGitHubHeatmap();

  return (
    <div className="w-full space-y-6">
      {/* Codeforces */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-yellow-400 shrink-0" fill="currentColor">
            <rect x="2" y="14" width="4" height="8" rx="1" />
            <rect x="10" y="6" width="4" height="16" rx="1" />
            <rect x="18" y="10" width="4" height="12" rx="1" />
          </svg>
          <span className="text-xs sm:text-sm font-semibold text-white">Codeforces</span>
          <span className="text-[10px] sm:text-xs text-[var(--palette-light-purple)]">({CF_USERNAME})</span>
          {cf.loading && <span className="text-xs text-[var(--palette-mid-purple)] animate-pulse">loading...</span>}
        </div>
        <HeatmapGrid weeks={weeks} countMap={cf.data} getColor={getCfColor} />
        <Legend colors={["bg-white/[0.04]", "bg-emerald-900/70", "bg-emerald-600/80", "bg-emerald-500", "bg-emerald-400"]} />
      </div>

      {/* GitHub */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white shrink-0" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="text-xs sm:text-sm font-semibold text-white">GitHub</span>
          <span className="text-[10px] sm:text-xs text-[var(--palette-light-purple)]">({GH_USERNAME})</span>
          {gh.loading && <span className="text-xs text-[var(--palette-mid-purple)] animate-pulse">loading...</span>}
        </div>
        <HeatmapGrid weeks={weeks} countMap={gh.data} getColor={getGhColor} />
        <Legend colors={["bg-white/[0.04]", "bg-sky-900/70", "bg-sky-600/80", "bg-sky-500", "bg-sky-400"]} />
      </div>
    </div>
  );
}
