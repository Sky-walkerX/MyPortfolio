"use client";

export function QuickFab() {
  return (
    <button
      className="quick-fab"
      type="button"
      aria-label="Open command palette"
      onClick={() => window.dispatchEvent(new Event("nk:open-palette"))}
    >
      <span className="glyph">⌘</span>
      <span className="label">run command</span>
      <kbd>⌘K</kbd>
    </button>
  );
}
