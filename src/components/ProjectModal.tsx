"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/data";

interface OpenDetail {
  project: Project;
}

export function ProjectModal() {
  const [active, setActive] = useState<Project | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenDetail>).detail;
      if (detail?.project) setActive(detail.project);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("nk:open-project", onOpen as EventListener);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("nk:open-project", onOpen as EventListener);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (active) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [active]);

  if (!active) return null;
  const dd = active.deepDive;
  const statusLabel =
    active.status === "live" ? "[LIVE]" : active.status === "wip" ? "[WIP]" : "[ARCHIVE]";
  const statusClass = active.status === "live" ? "ok" : active.status === "wip" ? "warn" : "muted";

  return (
    <div
      className="pm-root open"
      role="dialog"
      aria-modal="true"
      aria-label={`${active.name} — deep dive`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setActive(null);
      }}
    >
      <div className="pm-box">
        <div className="pm-head">
          <div className="lights" aria-hidden="true">
            <span className="r" />
            <span className="y" />
            <span className="g" />
          </div>
          <div className="pm-title">
            <span className="acc">./</span>
            {active.name}
            <span className="muted"> — deep-dive</span>
          </div>
          <button className="pm-close" type="button" onClick={() => setActive(null)} aria-label="Close">
            [ esc ]
          </button>
        </div>

        <div className="pm-body">
          <div className="pm-meta">
            <span className={`pm-status ${statusClass}`}>{statusLabel}</span>
            <span className="muted">·</span>
            <span className="pm-tagline">{dd.tagline}</span>
          </div>

          <Section title="$ cat ./problem.md">
            <p className="pm-text">{dd.problem}</p>
          </Section>

          <Section title="$ cat ./architecture.md">
            <p className="pm-text">{dd.architecture}</p>
          </Section>

          {dd.diagram && (
            <Section title="$ ./diagram --ascii">
              <pre className="pm-diagram">{dd.diagram}</pre>
            </Section>
          )}

          <Section title="$ ls ./system-design/">
            <ul className="pm-list">
              {dd.systemDesign.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </Section>

          <Section title="$ grep 'challenge' ./notes.log">
            <ul className="pm-list">
              {dd.challenges.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>

          <Section title="$ cat ./stack.conf">
            <div className="pm-tags">
              {active.tags.map((t) => (
                <span className="t" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </Section>
        </div>

        <div className="pm-foot">
          {active.links.live && (
            <a href={active.links.live} target="_blank" rel="noopener noreferrer" className="cli-btn primary">
              <span className="glyph">↗</span> live
            </a>
          )}
          <a href={active.links.source} target="_blank" rel="noopener noreferrer" className="cli-btn">
            <span className="glyph">$</span> source
          </a>
          <button type="button" onClick={() => setActive(null)} className="cli-btn">
            <span className="glyph">×</span> close
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pm-section">
      <div className="pm-section-title">{title}</div>
      {children}
    </div>
  );
}
