"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only mount on pointer-accurate devices (no touch)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let mx = -120, my = -120;
    let rx = -120, ry = -120;
    let sc = 1;
    let hovering = false;
    let visible = false;
    let raf: number;

    document.documentElement.style.setProperty("--cursor", "none");
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
      hovering = !!el.closest("a, button, [role='button'], input, textarea, select, label, .cli-btn, .proj-details-btn");
    };

    const onLeave = () => { visible = false; mx = -120; my = -120; };
    const onEnter = () => { visible = true; };

    const loop = () => {
      const LERP_POS = 0.13;
      const LERP_SC = 0.14;

      rx += (mx - rx) * LERP_POS;
      ry += (my - ry) * LERP_POS;
      const targetSc = hovering ? 1.7 : 1;
      sc += (targetSc - sc) * LERP_SC;

      const dot = dotRef.current;
      const ring = ringRef.current;
      if (dot) {
        dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
        dot.style.opacity = visible ? "1" : "0";
      }
      if (ring) {
        ring.style.transform = `translate(${rx - 13}px, ${ry - 13}px) scale(${sc})`;
        ring.style.opacity = visible ? (hovering ? "0.45" : "0.8") : "0";
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
      document.documentElement.style.removeProperty("--cursor");
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
