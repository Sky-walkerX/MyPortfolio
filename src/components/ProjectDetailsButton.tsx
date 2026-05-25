"use client";

import type { Project } from "@/lib/data";

export function ProjectDetailsButton({ project }: { project: Project }) {
  return (
    <button
      type="button"
      className="proj-details-btn"
      aria-label={`Open deep-dive for ${project.name}`}
      onClick={() =>
        window.dispatchEvent(new CustomEvent("nk:open-project", { detail: { project } }))
      }
    >
      <span className="glyph">▸</span> deep-dive
    </button>
  );
}
