"use client";

import { useEffect, useState } from "react";
import { ACCENT_PALETTES, type AccentName } from "@/lib/commands";

const STORAGE_KEY = "nk:tweaks";

interface TweakState {
  accent: AccentName;
  density: "compact" | "normal" | "comfy";
  scanlines: "on" | "off";
  grid: "on" | "off";
  motion: "on" | "off";
  cursorBlink: "on" | "off";
}

const DEFAULTS: TweakState = {
  accent: "violet",
  density: "normal",
  scanlines: "on",
  grid: "on",
  motion: "on",
  cursorBlink: "on",
};

function applyDom(t: TweakState) {
  const p = ACCENT_PALETTES[t.accent];
  const root = document.documentElement;
  root.style.setProperty("--accent", p.accent);
  root.style.setProperty("--accent-hi", p.hi);
  root.style.setProperty("--accent-08", p.accent + "14");
  root.style.setProperty("--accent-15", p.accent + "26");
  root.style.setProperty("--accent-30", p.accent + "4D");
  root.setAttribute("data-density", t.density);
  document.body.setAttribute("data-scanlines", t.scanlines);
  document.body.setAttribute("data-grid", t.grid);
  document.body.setAttribute("data-motion", t.motion);
  document.body.setAttribute("data-cursor-blink", t.cursorBlink);
}

export function Tweaks() {
  const [open, setOpen] = useState(false);
  const [tweaks, setTweaks] = useState<TweakState>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const merged: TweakState = { ...DEFAULTS, ...(stored ? JSON.parse(stored) : {}) };
      setTweaks(merged);
      applyDom(merged);
    } catch {
      applyDom(DEFAULTS);
    }
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<Partial<TweakState> | undefined>).detail;
      if (detail) {
        setTweaks((prev) => {
          const next = { ...prev, ...detail };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          applyDom(next);
          return next;
        });
      } else {
        setOpen(true);
      }
    };
    window.addEventListener("nk:open-tweaks", onOpen as EventListener);
    return () => window.removeEventListener("nk:open-tweaks", onOpen as EventListener);
  }, []);

  const setKey = <K extends keyof TweakState>(key: K, val: TweakState[K]) => {
    setTweaks((prev) => {
      const next = { ...prev, [key]: val };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      applyDom(next);
      return next;
    });
  };

  return (
    <div className={`tweaks-panel${open ? " open" : ""}`}>
      <div className="head">
        <div className="title">
          <span className="acc">⚙</span> tweaks
        </div>
        <button className="close" type="button" onClick={() => setOpen(false)}>
          [ esc ]
        </button>
      </div>
      <div className="body">
        <div className="tw-row">
          <span className="tw-label">accent</span>
          <div className="swatches">
            {(Object.keys(ACCENT_PALETTES) as AccentName[]).map((name) => (
              <button
                key={name}
                type="button"
                className={`sw${tweaks.accent === name ? " active" : ""}`}
                style={{ background: ACCENT_PALETTES[name].accent }}
                title={name}
                aria-label={name}
                onClick={() => setKey("accent", name)}
              />
            ))}
          </div>
        </div>
        <TweakRow label="density" current={tweaks.density} options={["compact", "normal", "comfy"]} onChange={(v) => setKey("density", v)} />
        <TweakRow label="scanlines" current={tweaks.scanlines} options={["on", "off"]} onChange={(v) => setKey("scanlines", v)} />
        <TweakRow label="dot grid" current={tweaks.grid} options={["on", "off"]} onChange={(v) => setKey("grid", v)} />
        <TweakRow label="motion" current={tweaks.motion} options={["on", "off"]} onChange={(v) => setKey("motion", v)} />
        <TweakRow label="cursor blink" current={tweaks.cursorBlink} options={["on", "off"]} onChange={(v) => setKey("cursorBlink", v)} />
      </div>
    </div>
  );
}

function TweakRow<T extends string>({
  label,
  current,
  options,
  onChange,
}: {
  label: string;
  current: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="tw-row">
      <span className="tw-label">{label}</span>
      <div className="tw-control">
        {options.map((v) => (
          <button
            key={v}
            type="button"
            className={`opt${current === v ? " active" : ""}`}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
