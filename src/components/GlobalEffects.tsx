"use client";

import { useEffect } from "react";

export function GlobalEffects() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reveal-on-scroll for elements with .r
    const revealEls = document.querySelectorAll<HTMLElement>(".r");
    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revealIo.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    revealEls.forEach((el) => revealIo.observe(el));

    // Typewriter for every .line containing a .cmd
    const lines = Array.from(document.querySelectorAll<HTMLElement>(".line")).filter((l) =>
      l.querySelector(".cmd"),
    );
    interface Recipe {
      line: HTMLElement;
      cmd: HTMLElement;
      cur: HTMLSpanElement;
      html: string;
      text: string;
      output: HTMLElement | null;
      played: boolean;
      queued?: boolean;
    }

    const recipes: Recipe[] = lines.map((line) => {
      const cmd = line.querySelector(".cmd") as HTMLElement;
      const html = cmd.innerHTML;
      const text = cmd.textContent ?? "";
      cmd.dataset.html = html;
      cmd.dataset.text = text;
      line.classList.add("tw-pending");
      const next = line.nextElementSibling;
      const target =
        next && next instanceof HTMLElement && next.classList.contains("output")
          ? (next as HTMLElement)
          : null;
      if (target) target.classList.add("tw-hide");
      const cur = document.createElement("span");
      cur.className = "tw-cursor";
      cmd.after(cur);
      return { line, cmd, cur, html, text, output: target, played: false };
    });

    const queue: Recipe[] = [];
    let pumping = false;

    function play(rec: Recipe, done?: () => void) {
      if (rec.played) {
        done?.();
        return;
      }
      rec.played = true;
      rec.line.classList.remove("tw-pending");
      rec.cmd.textContent = "";
      let i = 0;
      const base = 32;
      function tick() {
        if (i >= rec.text.length) {
          rec.cmd.innerHTML = rec.html;
          rec.cur?.remove();
          if (rec.output) requestAnimationFrame(() => rec.output!.classList.add("tw-show"));
          done?.();
          return;
        }
        rec.cmd.textContent = rec.text.slice(0, ++i);
        const jitter = Math.random() * 30 - 8;
        window.setTimeout(tick, base + jitter);
      }
      window.setTimeout(tick, 480);
    }

    function pump() {
      if (pumping) return;
      pumping = true;
      (function next() {
        const rec = queue.shift();
        if (!rec) {
          pumping = false;
          return;
        }
        play(rec, () => window.setTimeout(next, 140));
      })();
    }

    const twIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const rec = recipes.find((r) => r.line === e.target);
            if (rec && !rec.queued) {
              rec.queued = true;
              queue.push(rec);
              pump();
              twIo.unobserve(e.target);
            }
          }
        });
      },
      { threshold: 0.55, rootMargin: "0px 0px -10% 0px" },
    );

    if (document.body.getAttribute("data-motion") === "off") {
      recipes.forEach((r) => {
        r.line.classList.remove("tw-pending");
        r.cmd.innerHTML = r.html;
        r.cur?.remove();
        if (r.output) r.output.classList.add("tw-show");
        r.played = true;
      });
    } else {
      recipes.forEach((r) => twIo.observe(r.line));
    }

    // Vim-ish bindings: j/k scroll, gg/G jump
    let gPressed = 0;
    const editable = (el: Element | null) => {
      if (!el) return false;
      const tag = (el as HTMLElement).tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable;
    };
    const onKey = (e: KeyboardEvent) => {
      if (editable(document.activeElement)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const palette = document.querySelector(".palette-root.open");
      const snake = document.querySelector(".snake-root.open");
      const matrix = document.querySelector(".matrix-root.open");
      if (palette || snake || matrix) return;

      const k = e.key;
      if (k === "j") {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.18, behavior: "smooth" });
      } else if (k === "k") {
        e.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.18, behavior: "smooth" });
      } else if (k === "G") {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      } else if (k === "g") {
        gPressed++;
        if (gPressed === 2) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
          gPressed = 0;
        }
        window.setTimeout(() => {
          gPressed = 0;
        }, 400);
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      revealIo.disconnect();
      twIo.disconnect();
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
