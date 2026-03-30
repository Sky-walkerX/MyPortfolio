"use client";
import { cn } from "../lib/utils";
import React, { useEffect, useRef } from "react";

const getRandomStartPoint = (w, h) => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * (side % 2 === 0 ? w : h);
  switch (side) {
    case 0: return { x: offset, y: 0, angle: 45 };
    case 1: return { x: w, y: offset, angle: 135 };
    case 2: return { x: offset, y: h, angle: 225 };
    case 3: return { x: 0, y: offset, angle: 315 };
    default: return { x: 0, y: 0, angle: 45 };
  }
};

export const Starfield = ({
  className,
  starColor = "#ffffff",
  trailColor = "#ffffff",
  backgroundColor = "#0a0c14",
  numTwinkleStars = 50,
  starWidth = 20,
  starHeight = 1,
  minDelay = 200,
  maxDelay = 700,
  minSpeed = 12,
  maxSpeed = 28,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    // Twinkle stars (static positions, animated opacity)
    const twinkles = Array.from({ length: numTwinkleStars }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));

    // Shooting stars
    const shootingStars = [];
    let spawnTimer = 0;
    let nextSpawn = Math.random() * (maxDelay - minDelay) + minDelay;

    let frameId;
    let lastTime = performance.now();

    const animate = (now) => {
      const dt = now - lastTime;
      lastTime = now;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, w, h);

      // Draw twinkle stars
      const t = now / 1000;
      for (const s of twinkles) {
        const opacity = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = starColor;
        ctx.shadowColor = starColor;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Spawn shooting stars
      spawnTimer += dt;
      if (spawnTimer >= nextSpawn) {
        spawnTimer = 0;
        nextSpawn = Math.random() * (maxDelay - minDelay) + minDelay;
        const pt = getRandomStartPoint(w, h);
        shootingStars.push({
          ...pt,
          speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
          distance: 0,
        });
      }

      // Draw & update shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        const rad = (s.angle * Math.PI) / 180;
        s.x += s.speed * Math.cos(rad);
        s.y += s.speed * Math.sin(rad);
        s.distance += s.speed;
        const scale = 1 + s.distance / 100;
        const sw = starWidth * scale;

        if (s.x < -100 || s.x > w + 100 || s.y < -100 || s.y > h + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(s.x + sw / 2, s.y + starHeight / 2);
        ctx.rotate(rad);

        const grad = ctx.createLinearGradient(-sw / 2, 0, sw / 2, 0);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, starColor);
        ctx.fillStyle = grad;
        ctx.shadowColor = starColor;
        ctx.shadowBlur = 6;
        ctx.fillRect(-sw / 2, -starHeight / 2, sw, starHeight);
        ctx.restore();
      }
      ctx.shadowBlur = 0;

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      for (const s of twinkles) {
        s.x = Math.random() * w;
        s.y = Math.random() * h;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [numTwinkleStars, starColor, trailColor, backgroundColor, starWidth, starHeight, minDelay, maxDelay, minSpeed, maxSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full absolute inset-0 pointer-events-none", className)}
    />
  );
};
