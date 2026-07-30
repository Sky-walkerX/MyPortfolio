"use client";

import { useEffect, useRef, useState } from "react";
import { useTerminal } from "./TerminalSession";

/**
 * The hero's live shell. Short, high-signal set — `help` reveals the other 40.
 */
const HERO_CHIPS = [
  { cmd: "ls projects", label: "ls projects" },
  { cmd: "whoami", label: "whoami" },
  { cmd: "achievements", label: "achievements" },
  { cmd: "resume", label: "resume" },
  { cmd: "email", label: "email" },
  { cmd: "help", label: "help" },
] as const;

export function HeroPrompt() {
  const { lines, submit, complete, clear, recall, started, cwd, overlayOpen, setOverlayOpen } =
    useTerminal();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tailRef = useRef<HTMLDivElement | null>(null);
  const visibleRef = useRef(true);

  const focusInput = () => inputRef.current?.focus();

  /**
   * Type-ahead focus. Nothing is focused on load — so browser find, j/k
   * scrolling and screen-reader flow all behave normally — but typing a
   * printable character while the prompt is on screen routes it here.
   *
   * Capture phase + stopPropagation, because GlobalEffects binds j/k on
   * document and would otherwise scroll the page on the same keystroke.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (overlayOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1 || e.key === "/") return; // "/" still opens the overlay
      if (!visibleRef.current) return;
      if (document.body.getAttribute("data-boot") !== "done") return;

      const el = document.activeElement as HTMLElement | null;
      const tag = (el?.tagName ?? "").toUpperCase();
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;

      e.preventDefault();
      e.stopPropagation();
      setValue((v) => v + e.key);
      focusInput();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [overlayOpen]);

  /**
   * The boot swallows the keystroke that skips it. It hands the character
   * here instead, so typing during the boot isn't lost.
   */
  useEffect(() => {
    const onSeed = (e: Event) => {
      const key = (e as CustomEvent<{ key: string }>).detail?.key;
      if (!key) return;
      setValue((v) => v + key);
      // Wait for the boot overlay to finish fading before stealing focus.
      window.setTimeout(focusInput, 500);
    };
    window.addEventListener("nk:boot-seed", onSeed as EventListener);
    return () => window.removeEventListener("nk:boot-seed", onSeed as EventListener);
  }, []);

  /** Type-ahead only applies while the prompt is actually on screen. */
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { rootMargin: "-64px 0px 0px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  /** Keep the newest output in view as the session grows the page. */
  useEffect(() => {
    if (overlayOpen || lines.length === 0) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tailRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
    });
  }, [lines, overlayOpen]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(value);
    setValue("");
  };

  return (
    <div className="hp" ref={rootRef}>
      <form
        className="hp-field"
        autoComplete="off"
        onSubmit={onSubmit}
        onClick={focusInput}
        role="search"
      >
        <span className="hp-lead" aria-hidden="true">
          {/* host collapses under 600px so the input keeps usable width */}
          <span className="hp-host">
            <span className="u">naman</span>
            <span className="c">@</span>
            <span className="h">portfolio</span>
            <span className="c">:</span>
          </span>
          <span className="p">{cwd}</span>
          <span className="d">$</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          className="hp-input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="type a command · start with help"
          aria-label="Run a command. Type help to list everything available."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              const prev = recall(-1);
              if (prev === null) return;
              e.preventDefault();
              setValue(prev);
            } else if (e.key === "ArrowDown") {
              const next = recall(1);
              if (next === null) return;
              e.preventDefault();
              setValue(next);
            } else if (e.key === "Tab") {
              e.preventDefault();
              const completed = complete(value);
              if (completed) setValue(completed);
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
              e.preventDefault();
              clear();
            } else if (e.key === "Escape") {
              setValue("");
            }
          }}
        />
        <button
          className="hp-go"
          type="submit"
          aria-label="Run command"
          tabIndex={-1}
        >
          ↵
        </button>
      </form>

      <div className="hp-chips">
        <span className="hp-chips-label" aria-hidden="true"># try:</span>
        {HERO_CHIPS.map((c) => (
          <button
            key={c.cmd}
            type="button"
            className="hp-chip"
            onClick={() => {
              submit(c.cmd);
              setValue("");
              focusInput();
            }}
          >
            <span className="g" aria-hidden="true">$</span> {c.label}
          </button>
        ))}
      </div>

      {started ? (
        <div className="hp-session" data-started="true">
          <div className="hp-session-bar">
            <span className="hp-session-title">
              session <span className="muted">· {lines.length} lines</span>
            </span>
            <span className="hp-session-actions">
              <button type="button" onClick={() => setOverlayOpen(true)}>
                fullscreen ⌘K
              </button>
              <button
                type="button"
                onClick={() => {
                  clear();
                  focusInput();
                }}
              >
                clear
              </button>
            </span>
          </div>
          <div className="hp-out" role="log" aria-live="polite" aria-label="Command output">
            {lines.map((l) => (
              <div
                key={l.id}
                className={`echo${l.cls ? ` ${l.cls}` : ""}`}
                dangerouslySetInnerHTML={{ __html: l.html }}
              />
            ))}
            <div ref={tailRef} />
          </div>
        </div>
      ) : null}

      {/* One hint line, both states. Keys on the left, easter eggs on the right —
          the only place any of this is said. */}
      <p className="hp-hint">
        <span className="k">
          <kbd>tab</kbd> completes <span className="sep">·</span> <kbd>↑</kbd> recalls{" "}
          <span className="sep">·</span> <kbd>⌘K</kbd> fullscreen <span className="sep">·</span>{" "}
          <kbd>j</kbd>/<kbd>k</kbd> scrolls
        </span>
        <span className="e">
          try <button type="button" onClick={() => submit("snake")}>snake</button>,{" "}
          <button type="button" onClick={() => submit("neofetch")}>neofetch</button>,{" "}
          <button type="button" onClick={() => submit("sudo hire naman")}>sudo hire naman</button>
        </span>
      </p>
    </div>
  );
}
