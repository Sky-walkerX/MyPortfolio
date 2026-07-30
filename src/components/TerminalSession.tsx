"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createShell } from "@/lib/shell";
import { cwdLabel, type Cwd } from "@/lib/fs";
import { PROJECTS } from "@/lib/data";
import { escapeHTML } from "@/lib/commands";

export interface TerminalLine {
  id: number;
  html: string;
  cls: string;
}

interface TerminalApi {
  lines: TerminalLine[];
  /** Echo the command, run it, and record it in history. */
  submit: (raw: string) => void;
  /** Tab completion — returns the completed value, or null if it printed candidates. */
  complete: (partial: string) => string | null;
  clear: () => void;
  /** Walk shell history. `dir` is -1 for older, +1 for newer. */
  recall: (dir: -1 | 1) => string | null;
  /** True once the visitor has run anything — the hero uses this to reveal its pane. */
  started: boolean;
  /** Working directory, e.g. `~` or `~/projects` — both prompts render it. */
  cwd: string;
  overlayOpen: boolean;
  setOverlayOpen: (open: boolean) => void;
}

const TerminalContext = createContext<TerminalApi | null>(null);

/** Scrollback cap. The hero session grows the page, so it can't run forever. */
const MAX_LINES = 120;

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [cwd, setCwd] = useState("~");

  const idRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const histIdxRef = useRef(-1);
  // `requestClose` fires from timeouts inside the shell, so it reads the
  // setter through a ref rather than closing over a stale render.
  const closeRef = useRef<() => void>(() => {});
  closeRef.current = () => setOverlayOpen(false);

  const emit = useCallback((html: string, cls = "") => {
    setLines((prev) => {
      const next = [...prev, { id: idRef.current++, html, cls }];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
  }, []);

  const clear = useCallback(() => setLines([]), []);

  // One shell for the whole page. Both surfaces write into the same scrollback.
  const shell = useMemo(
    () =>
      createShell({
        emit,
        clear,
        requestClose: () => closeRef.current(),
        onCwdChange: (next: Cwd) => setCwd(cwdLabel(next)),
        // `view <project>` opens the same modal the Projects section opens.
        openProject: (name) => {
          const project = PROJECTS.find((p) => p.name === name);
          if (!project) return;
          window.dispatchEvent(new CustomEvent("nk:open-project", { detail: { project } }));
        },
      }),
    [emit, clear],
  );

  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      historyRef.current.push(trimmed);
      histIdxRef.current = -1;
      // Echo with the cwd the command actually ran in, before it can change.
      emit(
        `<span class="echo-prompt">naman@portfolio:${cwdLabel(shell.cwd())}$</span><span class="echo-cmd">${escapeHTML(trimmed)}</span>`,
        "cmd",
      );
      shell.run(trimmed);
    },
    [emit, shell],
  );

  const recall = useCallback((dir: -1 | 1): string | null => {
    const hist = historyRef.current;
    if (hist.length === 0) return null;
    if (dir === -1) {
      histIdxRef.current = Math.max(
        0,
        (histIdxRef.current === -1 ? hist.length : histIdxRef.current) - 1,
      );
      return hist[histIdxRef.current] ?? "";
    }
    if (histIdxRef.current === -1) return null;
    histIdxRef.current = Math.min(hist.length, histIdxRef.current + 1);
    return histIdxRef.current === hist.length ? "" : (hist[histIdxRef.current] ?? "");
  }, []);

  const value = useMemo<TerminalApi>(
    () => ({
      lines,
      submit,
      complete: shell.complete,
      clear,
      recall,
      started: lines.length > 0,
      cwd,
      overlayOpen,
      setOverlayOpen,
    }),
    [lines, submit, shell.complete, clear, recall, cwd, overlayOpen],
  );

  return <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>;
}

export function useTerminal(): TerminalApi {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error("useTerminal must be used inside <TerminalProvider>");
  return ctx;
}
