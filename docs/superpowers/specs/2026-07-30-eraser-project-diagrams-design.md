# Eraser-generated project diagrams — design

## Problem

Each project in `src/lib/data.ts` has a `deepDive.diagram` field: hand-written ASCII art rendered in `ProjectModal.tsx` under a `$ ./diagram --ascii` section. It matches the terminal aesthetic but is limited in the amount of architectural detail it can show clearly (box-drawing characters only, no room for nuance).

## Goal

Replace the ASCII diagrams with Eraser-generated architecture diagrams for all 3 projects (trequila, skillswap, lockin), giving richer detail while still fitting the site's dark terminal look.

## Scope

- All 3 projects in `PROJECTS` get a diagram.
- Full replacement — no dual ASCII+image state, no toggle.
- `src/lib/commands.tsx` and `CommandPalette.tsx` hold an independent, simpler copy of project data (per CLAUDE.md) and do not reference `deepDive.diagram` — out of scope, no changes needed there.

## Data model change

`src/lib/data.ts`:

```ts
export interface ProjectDeepDive {
  tagline: string;
  problem: string;
  architecture: string;
  systemDesign: string[];
  challenges: string[];
  diagram?: { src: string; alt: string };  // was: diagram?: string (ascii art)
}
```

Each project's `deepDive.diagram` becomes `{ src: "/assets/projects/<name>/diagram.png", alt: "<name> architecture diagram" }`.

## Diagram generation

- Tool: `mcp__eraser__create_diagram`, one call per project.
- Input: a natural-language `text` prompt built from that project's existing `architecture` string + `systemDesign[]` bullets (not hand-written DSL — let Eraser's AI pick layout/diagram type).
- Style params, fixed across all 3 for visual consistency:
  - `theme: "dark"`
  - `background: false` (transparent — blends into the modal's dark background; site has no light/dark toggle, always dark)
  - `typeface: "mono"`
  - `colorMode: "outline"`
  - `format: "png"` (SVG is not available — `create_diagram`/`update_diagram`/`export_diagram` only expose `format: png | jpeg` in this MCP's tool schema)
- New private Eraser files (one per project), not shared to a team.
- Export via `export_diagram` (or `includeImage: true` on create) to get a temporary image URL, then download and commit the PNG to `public/assets/projects/<name>/diagram.png`.

## Rendering change

`src/components/ProjectModal.tsx`:

- Replace:
  ```tsx
  {dd.diagram && (
    <Section title="$ ./diagram --ascii">
      <pre className="pm-diagram">{dd.diagram}</pre>
    </Section>
  )}
  ```
- With:
  ```tsx
  {dd.diagram && (
    <Section title="$ ./diagram --png">
      <img className="pm-diagram-img" src={dd.diagram.src} alt={dd.diagram.alt} />
    </Section>
  )}
  ```

## Styling

`src/styles/globals.css`: add `.pm-diagram-img` — `max-width: 100%`, `height: auto`, reuse the existing `.pm-diagram` box/border treatment (same frame, padding, background token) so the swap doesn't disturb surrounding modal chrome.

## Testing / verification

No test runner in this repo. Verify with:
- `npm run typecheck` (interface change is source-compatible everywhere `dd.diagram` is read/written once `data.ts` and `ProjectModal.tsx` are updated together)
- `npm run build`
- Manual check: open each project's deep-dive modal in the browser, confirm diagram renders, fits dark background, doesn't overflow on mobile widths.

## Out of scope / explicitly not doing

- No SVG export (blocked by MCP tool schema — png only).
- No live/embedded Eraser iframe.
- No changes to `commands.tsx` / `CommandPalette.tsx`.
- No new light theme handling for the diagrams.
