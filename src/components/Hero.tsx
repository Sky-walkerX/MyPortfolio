"use client";

import { useEffect, useRef } from "react";
import { HeroPrompt } from "./HeroPrompt";

const NOISE = "!@#$%^&*<>/\\|?+={}~[];:§Ø£¶ΔΣΩπμ";

/**
 * One resolve, once, when the page is actually ready to be read — not the old
 * random 8–12s loop, which re-scrambled the name while people were reading it.
 */
function useNameResolve(refs: React.RefObject<HTMLSpanElement[]>) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.body.getAttribute("data-motion") === "off") return;

    let alive = true;
    const timers: number[] = [];

    const scramble = (el: HTMLSpanElement) => {
      const original = el.dataset.text ?? el.textContent ?? "";
      el.classList.add("go");
      let frame = 0;
      const frames = 7;
      const tick = () => {
        if (!alive) return;
        if (frame >= frames) {
          el.textContent = original;
          el.classList.remove("go");
          return;
        }
        const chars = original.split("");
        // Resolve left-to-right: each frame locks in a few more real characters.
        const settled = Math.floor((frame / frames) * original.length);
        for (let i = settled; i < chars.length; i++) {
          if (chars[i] === " ") continue;
          chars[i] = NOISE[Math.floor(Math.random() * NOISE.length)];
        }
        el.textContent = chars.join("");
        frame++;
        timers.push(window.setTimeout(tick, 52));
      };
      tick();
    };

    const start = () => {
      const targets = refs.current?.filter(Boolean) ?? [];
      targets.forEach((el, i) => {
        timers.push(window.setTimeout(() => alive && scramble(el), i * 110));
      });
    };

    // Wait for the boot overlay to finish before spending the reveal.
    if (document.body.getAttribute("data-boot") === "done") {
      timers.push(window.setTimeout(start, 120));
    } else {
      const obs = new MutationObserver(() => {
        if (document.body.getAttribute("data-boot") === "done") {
          obs.disconnect();
          timers.push(window.setTimeout(start, 120));
        }
      });
      obs.observe(document.body, { attributes: true, attributeFilter: ["data-boot"] });
      return () => {
        alive = false;
        obs.disconnect();
        timers.forEach((t) => window.clearTimeout(t));
      };
    }

    return () => {
      alive = false;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [refs]);
}

export function Hero() {
  const namingRefs = useRef<HTMLSpanElement[]>([]);
  useNameResolve(namingRefs);

  const setRef = (i: number) => (el: HTMLSpanElement | null) => {
    if (el) namingRefs.current[i] = el;
  };

  return (
    <section className="session hero-session" aria-label="intro">
      <div className="hero-head">
        <h1 className="hero-name">
          <span className="glitch" data-text="naman" ref={setRef(0)}>
            naman
          </span>{" "}
          <span className="glitch" data-text="khandelwal" ref={setRef(1)}>
            khandelwal
          </span>
          <span className="acc">.</span>
        </h1>
        <p className="hero-card">
          <span className="hl">IIIT Lucknow</span> <span className="sep">·</span>{" "}
          <span className="hl">Summer of Bitcoin</span> <span className="muted">@</span>{" "}
          <span className="hl">Formstr</span>
          <br />
          Codeforces <span className="hl">Expert</span> <span className="sep">·</span> ICPC prelims{" "}
          <span className="hl">137</span> <span className="sep">·</span> LeetCode{" "}
          <span className="hl">Knight</span>
        </p>
      </div>

      <HeroPrompt />
    </section>
  );
}
