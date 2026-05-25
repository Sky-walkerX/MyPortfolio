"use client";

import { useEffect, useRef } from "react";

const NOISE = "!@#$%^&*<>/\\|?+={}~[];:§Ø£¶ΔΣΩπμ";

export function Hero() {
  const namingRefs = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.body.getAttribute("data-motion") === "off") return;

    const targets = namingRefs.current.filter(Boolean);
    if (targets.length === 0) return;

    let alive = true;
    const timers: number[] = [];

    function scramble(el: HTMLSpanElement) {
      const original = el.dataset.text ?? el.textContent ?? "";
      el.classList.add("go");
      let frame = 0;
      const frames = 6;
      const tick = () => {
        if (!alive) return;
        if (frame >= frames) {
          el.textContent = original;
          el.classList.remove("go");
          return;
        }
        const chars = original.split("");
        const swaps = Math.max(1, Math.floor(original.length * 0.35));
        for (let i = 0; i < swaps; i++) {
          const idx = Math.floor(Math.random() * chars.length);
          chars[idx] = NOISE[Math.floor(Math.random() * NOISE.length)];
        }
        el.textContent = chars.join("");
        frame++;
        timers.push(window.setTimeout(tick, 55));
      };
      tick();
    }

    function loop() {
      const delay = 8000 + Math.random() * 4000;
      timers.push(
        window.setTimeout(() => {
          if (!alive) return;
          if (document.body.getAttribute("data-motion") !== "off") {
            if (Math.random() > 0.45) targets.forEach(scramble);
            else scramble(targets[Math.floor(Math.random() * targets.length)]);
          }
          loop();
        }, delay),
      );
    }
    loop();

    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const setRef = (i: number) => (el: HTMLSpanElement | null) => {
    if (el) namingRefs.current[i] = el;
  };

  const openPalette = () => window.dispatchEvent(new Event("nk:open-palette"));

  return (
    <section className="session" aria-label="intro">
      <div className="line">
        <span className="prompt">
          <span className="c"># Last login: Mon May 25 2026 on ttys001</span>
        </span>
      </div>
      <div className="line">
        <span className="prompt">
          <span className="u">naman</span>
          <span className="c">@</span>
          <span className="h">portfolio</span>
          <span className="c">:</span>
          <span className="p">~</span>
          <span className="d">$</span>
        </span>
        <span className="cmd">./welcome.sh</span>
      </div>

      <div className="hero">
        <span className="hero-corner tl" />
        <span className="hero-corner tr" />
        <span className="hero-corner bl" />
        <span className="hero-corner br" />

        <p className="hero-eyebrow">
          <span className="acc">›</span> hello world. i&apos;m
        </p>
        <h1 className="hero-name">
          <span className="glitch" data-text="naman" ref={setRef(0)}>
            naman
          </span>
          <span className="acc">.</span>
          <br />
          <span className="glitch" data-text="khandelwal" ref={setRef(1)}>
            khandelwal
          </span>
          <span className="cursor">█</span>
        </h1>
        <p className="hero-role">
          full-stack developer<span className="sep">·</span>distributed systems
          <span className="sep">·</span>open source
        </p>

        <div className="hero-meta">
          <span>
            <span className="k">@</span> <span className="v">IIIT Lucknow</span>
          </span>
          <span>
            <span className="k">role:</span> <span className="v">Summer of Bitcoin Intern</span>
          </span>
          <span>
            <span className="k">at:</span> <span className="v">Formstr</span>
          </span>
          <span>
            <span className="k">status:</span> <span className="v">shipping</span>
          </span>
        </div>
      </div>

      <div className="line">
        <span className="prompt">
          <span className="u">naman</span>
          <span className="c">@</span>
          <span className="h">portfolio</span>
          <span className="c">:</span>
          <span className="p">~</span>
          <span className="d">$</span>
        </span>
        <span className="cmd">
          whoami <span className="flag">--short</span>
        </span>
      </div>
      <div className="output">
        <div className="out-row">
          <span className="gt" />
          <span>
            3rd year CS undergrad at <span className="hl">IIIT Lucknow</span> (GPA 8.90).
          </span>
        </div>
        <div className="out-row">
          <span className="gt" />
          <span>
            Currently a <span className="acc">Summer of Bitcoin</span> intern at Formstr — shipping the Formstr
            Super App.
          </span>
        </div>
        <div className="out-row">
          <span className="gt" />
          <span>Specialist on Codeforces · 4★ on CodeChef · ICPC India Prelims 2025 (rank 137).</span>
        </div>
      </div>

      <div className="line">
        <span className="prompt">
          <span className="u">naman</span>
          <span className="c">@</span>
          <span className="h">portfolio</span>
          <span className="c">:</span>
          <span className="p">~</span>
          <span className="d">$</span>
        </span>
        <span className="cmd">help</span>
      </div>
      <div className="output">
        <div className="btn-row" style={{ marginTop: 10 }}>
          <a href="#work" className="cli-btn primary">
            <span className="glyph">$</span> view projects
          </a>
          <a
            href="https://github.com/Sky-walkerX"
            target="_blank"
            rel="noopener noreferrer"
            className="cli-btn"
          >
            <span className="glyph">↗</span> github
          </a>
          <a href="mailto:namankhandelwal.dev@gmail.com" className="cli-btn">
            <span className="glyph">✉</span> email
          </a>
          <button className="cli-btn" type="button" onClick={openPalette}>
            <span className="glyph">⌘</span> open terminal
          </button>
        </div>
        <p style={{ color: "var(--fg-4)", fontSize: 12, margin: "14px 0 0" }}>
          # tip:{" "}
          <kbd
            style={{
              fontFamily: "var(--font-mono-stack)",
              fontSize: 11,
              padding: "1px 5px",
              background: "var(--bg-3)",
              border: "1px solid var(--border-1)",
            }}
          >
            ⌘ K
          </kbd>{" "}
          or{" "}
          <kbd
            style={{
              fontFamily: "var(--font-mono-stack)",
              fontSize: 11,
              padding: "1px 5px",
              background: "var(--bg-3)",
              border: "1px solid var(--border-1)",
            }}
          >
            /
          </kbd>{" "}
          opens the terminal ·{" "}
          <kbd
            style={{
              fontFamily: "var(--font-mono-stack)",
              fontSize: 11,
              padding: "1px 5px",
              background: "var(--bg-3)",
              border: "1px solid var(--border-1)",
            }}
          >
            j
          </kbd>
          /
          <kbd
            style={{
              fontFamily: "var(--font-mono-stack)",
              fontSize: 11,
              padding: "1px 5px",
              background: "var(--bg-3)",
              border: "1px solid var(--border-1)",
            }}
          >
            k
          </kbd>{" "}
          scrolls · try <span style={{ color: "var(--accent)" }}>snake</span>
        </p>
      </div>
    </section>
  );
}
