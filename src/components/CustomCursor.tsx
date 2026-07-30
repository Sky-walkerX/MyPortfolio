"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let sc = 1;
    let hovering = false;
    let visible = false;
    let raf: number;

    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        rx = mx;
        ry = my;
        visible = true;
      }
      const el = e.target as Element;
      hovering = !!el.closest(
        "a, button, [role='button'], input, textarea, select, label, .cli-btn, .k"
      );
    };

    const onLeave = () => { visible = false; };
    const onEnter = () => { visible = true; };

    const loop = () => {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      sc += ((hovering ? 1.65 : 1) - sc) * 0.14;

      const dot = dotRef.current;
      const ring = ringRef.current;

      if (dot) {
        dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
        dot.style.opacity = visible ? "1" : "0";
      }
      if (ring) {
        ring.style.transform = `translate(${rx - 15}px, ${ry - 15}px) scale(${sc})`;
        ring.style.opacity = visible ? (hovering ? "0.55" : "1") : "0";
      }

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="nk-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="nk-cursor-ring" aria-hidden="true" />
    </>
  );
}
