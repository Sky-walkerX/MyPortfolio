"use client";

import { useEffect, useRef, useState } from "react";
import { SUGGEST_CHIPS } from "@/lib/commands";
import { useTerminal } from "./TerminalSession";

/**
 * Fullscreen view of the same session the hero prompt is running. It owns no
 * command logic and no scrollback — both live in <TerminalProvider>, so ⌘K is
 * a change of surface, not a second terminal.
 */
export function CommandPalette() {
  const { lines, submit, complete, clear, recall, cwd, overlayOpen, setOverlayOpen } = useTerminal();
  const [value, setValue] = useState("");
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const close = () => setOverlayOpen(false);

  useEffect(() => {
    const onOpen = () => setOverlayOpen(true);
    const onClose = () => setOverlayOpen(false);
    window.addEventListener("nk:open-palette", onOpen);
    window.addEventListener("nk:close-palette", onClose);

    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      const el = document.activeElement as HTMLElement | null;
      const tag = (el?.tagName ?? "").toUpperCase();
      const inField = tag === "INPUT" || tag === "TEXTAREA" || !!el?.isContentEditable;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOverlayOpen(!overlayOpen);
      } else if (e.key === "/" && !inField) {
        e.preventDefault();
        setOverlayOpen(true);
      } else if (e.key === "Escape" && overlayOpen) {
        setOverlayOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("nk:open-palette", onOpen);
      window.removeEventListener("nk:close-palette", onClose);
      document.removeEventListener("keydown", onKey);
    };
  }, [overlayOpen, setOverlayOpen]);

  useEffect(() => {
    if (!overlayOpen) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(t);
  }, [overlayOpen]);

  useEffect(() => {
    if (!overlayOpen) return;
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines, overlayOpen]);

  return (
    <div
      className={`palette-root${overlayOpen ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Command terminal"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="palette">
        <div className="palette-head">
          <div className="lights" aria-hidden="true">
            <span className="r" />
            <span className="y" />
            <span className="g" />
          </div>
          <div className="title">
            <span className="acc">naman</span>@portfolio — bash
          </div>
          <button className="close" type="button" onClick={close} aria-label="Close terminal">
            esc
          </button>
        </div>

        <div className="palette-body" ref={bodyRef}>
          {lines.length === 0 ? (
            <div className="echo">
              <span className="muted">last login: Mon May 25 2026 on ttys001</span>
              {"\n"}
              <span className="hl">
                Welcome to <span className="acc">naman@portfolio</span>
              </span>
              {"\n"}
              <span>
                type <span className="acc">help</span> to see what you can do.
              </span>
            </div>
          ) : (
            lines.map((l) => (
              <div
                key={l.id}
                className={`echo${l.cls ? ` ${l.cls}` : ""}`}
                dangerouslySetInnerHTML={{ __html: l.html }}
              />
            ))
          )}
        </div>

        <div className="palette-suggest">
          <span className="label"># try:</span>
          {SUGGEST_CHIPS.map((c) => (
            <button
              key={c}
              className="chip"
              type="button"
              onClick={() => {
                submit(c);
                setValue("");
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <form
          className="palette-input-row"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
            setValue("");
          }}
        >
          <span className="lead">
            <span className="u">naman</span>
            <span style={{ color: "var(--fg-4)" }}>@</span>
            <span className="at">portfolio</span>
            <span style={{ color: "var(--fg-4)" }}>:</span>
            <span className="cwd">{cwd}</span>
            <span className="d">$</span>
          </span>
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="command"
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
              }
            }}
          />
        </form>
      </div>
    </div>
  );
}
