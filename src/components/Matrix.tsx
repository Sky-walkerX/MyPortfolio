"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "01アァカサタナハマヤャラワABCDEF#$%&*+={}[]<>/\\|;:";

export function Matrix() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("nk:open-matrix", onOpen);
    return () => window.removeEventListener("nk:open-matrix", onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#7B61FF";
    const green =
      getComputedStyle(document.documentElement).getPropertyValue("--green").trim() || "#6CE5B2";

    let raf = 0;
    let drops: number[] = [];
    const fontSize = 14;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      const columns = Math.floor(window.innerWidth / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * 30);
    }
    resize();

    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = "rgba(5,5,5,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = Math.random() > 0.92 ? accent : green;
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    function escHandler(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key.length === 1 || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    }

    window.addEventListener("resize", resize);
    window.addEventListener("keydown", escHandler, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", escHandler, true);
    };
  }, [open]);

  return (
    <div className={`matrix-root${open ? " open" : ""}`} onClick={() => setOpen(false)}>
      <canvas ref={canvasRef} />
      <div className="hint">[ esc · click · any key to exit ]</div>
    </div>
  );
}
