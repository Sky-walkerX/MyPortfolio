"use client";

import { useEffect, useRef, useState } from "react";

const CELL = 20;
const SIZE = 20;
const STEP_MS = 95;

interface Point {
  x: number;
  y: number;
}

function hexToRGBA(hex: string, a: number) {
  const m = hex.replace("#", "");
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function cssVar(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function Snake() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("nk:open-snake", onOpen);
    return () => window.removeEventListener("nk:open-snake", onOpen);
  }, []);

  useEffect(() => {
    try {
      setBest(parseInt(localStorage.getItem("nk:snake:best") ?? "0", 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let snake: Point[] = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    let dir: Point = { x: 1, y: 0 };
    let queuedDir = dir;
    let alive = true;
    let paused = false;
    let lastStep = performance.now();
    let raf = 0;
    let curScore = 0;
    let food: Point = randFood();

    function randFood(): Point {
      while (true) {
        const f = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
        if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
      }
    }

    function reset() {
      snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      dir = { x: 1, y: 0 };
      queuedDir = dir;
      food = randFood();
      curScore = 0;
      alive = true;
      paused = false;
      lastStep = performance.now();
      setScore(0);
    }

    function step() {
      if (!alive || paused) return;
      dir = queuedDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE) {
        alive = false;
        return;
      }
      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        alive = false;
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        curScore += 1;
        food = randFood();
        try {
          const newBest = Math.max(parseInt(localStorage.getItem("nk:snake:best") ?? "0", 10) || 0, curScore);
          localStorage.setItem("nk:snake:best", String(newBest));
          setBest(newBest);
        } catch {
          /* ignore */
        }
        setScore(curScore);
      } else {
        snake.pop();
      }
    }

    function overlay(text: string, color: string) {
      if (!ctx) return;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = color;
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas!.width / 2, canvas!.height / 2);
    }

    function draw() {
      if (!ctx || !canvas) return;
      const accent = cssVar("--accent", "#7B61FF");
      const green = cssVar("--green", "#6CE5B2");
      const fg = cssVar("--fg-1", "#f0ede8");
      const bg2 = cssVar("--bg-2", "#111");
      const border = cssVar("--border-1", "rgba(240,237,232,0.1)");

      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = bg2;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 1; i < SIZE; i++) {
        ctx.moveTo(i * CELL + 0.5, 0);
        ctx.lineTo(i * CELL + 0.5, H);
        ctx.moveTo(0, i * CELL + 0.5);
        ctx.lineTo(W, i * CELL + 0.5);
      }
      ctx.stroke();

      ctx.fillStyle = green;
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", food.x * CELL + CELL / 2, food.y * CELL + CELL / 2 + 1);

      snake.forEach((s, i) => {
        const alpha = 1 - (i / snake.length) * 0.55;
        ctx.fillStyle = hexToRGBA(accent, alpha);
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      });

      if (snake[0]) {
        ctx.fillStyle = fg;
        const h = snake[0];
        ctx.fillRect(h.x * CELL + CELL / 2 - 2, h.y * CELL + CELL / 2 - 2, 4, 4);
      }

      if (paused) overlay("PAUSED — space to resume", accent);
      else if (!alive) overlay("GAME OVER — press R to restart", "#FF6B6B");
    }

    function loop(now: number) {
      if (now - lastStep >= STEP_MS) {
        step();
        lastStep = now;
      }
      draw();
      raf = requestAnimationFrame(loop);
    }

    function setDir(nx: number, ny: number) {
      if (snake.length > 1 && dir.x + nx === 0 && dir.y + ny === 0) return;
      queuedDir = { x: nx, y: ny };
    }

    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      const handled = [
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        "w",
        "a",
        "s",
        "d",
        "h",
        "j",
        "k",
        "l",
        " ",
        "r",
        "escape",
      ];
      if (!handled.includes(k)) return;
      e.preventDefault();
      e.stopPropagation();
      switch (k) {
        case "arrowup":
        case "k":
        case "w":
          setDir(0, -1);
          break;
        case "arrowdown":
        case "j":
        case "s":
          setDir(0, 1);
          break;
        case "arrowleft":
        case "h":
        case "a":
          setDir(-1, 0);
          break;
        case "arrowright":
        case "l":
        case "d":
          setDir(1, 0);
          break;
        case " ":
          paused = !paused;
          break;
        case "r":
          reset();
          break;
        case "escape":
          setOpen(false);
          break;
      }
    }

    window.addEventListener("keydown", onKey, true);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div
      className={`snake-root${open ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="snake-box">
        <div className="snake-head">
          <div>
            <span className="title">▶ snake.exe</span>{" "}
            <span style={{ color: "var(--fg-4)" }}>— survive as long as you can</span>
          </div>
          <div className="close" onClick={() => setOpen(false)}>
            [ esc ]
          </div>
        </div>
        <canvas ref={canvasRef} className="snake-canvas" width={400} height={400} />
        <div className="snake-foot">
          <div className="score">
            score: <b>{score}</b> &nbsp; best: <b>{best}</b>
          </div>
          <div>
            <kbd>←↑↓→</kbd>/<kbd>hjkl</kbd> move &nbsp; <kbd>space</kbd> pause &nbsp; <kbd>r</kbd> restart
          </div>
        </div>
      </div>
    </div>
  );
}
