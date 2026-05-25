"use client";

export function PaletteButton({
  className = "cli-btn",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={className}
      type="button"
      onClick={() => window.dispatchEvent(new Event("nk:open-palette"))}
    >
      {children}
    </button>
  );
}
