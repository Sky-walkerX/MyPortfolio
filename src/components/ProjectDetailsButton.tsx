"use client";

import type { Project } from "@/lib/data";

export function ProjectDetailsButton({ project }: { project: Project }) {
  return (
    <button
      type="button"
      className="proj-action"
      aria-label={`Open deep-dive for ${project.name}`}
      onClick={() =>
        window.dispatchEvent(new CustomEvent("nk:open-project", { detail: { project } }))
      }
    >
      <div className="pa-head">
        <span className="glyph">▸</span>
        <span className="pa-label">deep-dive</span>
      </div>
      <div className="pa-meta">{project.deepDive.tagline}</div>
    </button>
  );
}
