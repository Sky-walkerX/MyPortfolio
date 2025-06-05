"use client";
import { cn } from "../lib/utils";
import React, { useEffect, useState, useRef } from "react";

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * (side % 2 === 0 ? window.innerWidth : window.innerHeight);

  switch (side) {
    case 0: return { x: offset, y: 0, angle: 45 };
    case 1: return { x: window.innerWidth, y: offset, angle: 135 };
    case 2: return { x: offset, y: window.innerHeight, angle: 225 };
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
  const [stars, setStars] = useState([]);
  const [twinkles, setTwinkles] = useState([]);

  const svgRef = useRef(null);

  // Generate static twinkling stars
  useEffect(() => {
    const generated = Array.from({ length: numTwinkleStars }, () => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 3,
    }));
    setTwinkles(generated);
  }, [numTwinkleStars]);

  // Add shooting stars periodically
  useEffect(() => {
    let timeoutId;
    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      const newStar = {
        id: Date.now() + Math.random(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      };
      setStars((prev) => [...prev, newStar]);

      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutId = setTimeout(createStar, delay);
    };

    createStar();
    return () => clearTimeout(timeoutId);
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  // Animate stars
  useEffect(() => {
    const moveStars = () => {
      setStars((prevStars) =>
        prevStars
          .map((star) => {
            const newX = star.x + star.speed * Math.cos((star.angle * Math.PI) / 180);
            const newY = star.y + star.speed * Math.sin((star.angle * Math.PI) / 180);
            const newDistance = star.distance + star.speed;
            const newScale = 1 + newDistance / 100;

            if (
              newX < -100 || newX > window.innerWidth + 100 ||
              newY < -100 || newY > window.innerHeight + 100
            ) {
              return null;
            }

            return {
              ...star,
              x: newX,
              y: newY,
              distance: newDistance,
              scale: newScale,
            };
          })
          .filter(Boolean)
      );
      requestAnimationFrame(moveStars);
    };

    const frame = requestAnimationFrame(moveStars);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      ref={svgRef}
      className={cn("w-full h-full absolute inset-0 pointer-events-none", className)}
      style={{ backgroundColor }}
    >
      {/* Twinkle Stars */}
      {twinkles.map((twinkle) => (
        <circle
          key={twinkle.id}
          cx={twinkle.x}
          cy={twinkle.y}
          r={twinkle.radius}
          fill={starColor}
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2s"
            begin={`${twinkle.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Shooting Stars */}
      {stars.map((star) => (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill="url(#gradient)"
          filter="url(#glow)"
          transform={`rotate(${star.angle}, ${
            star.x + (starWidth * star.scale) / 2
          }, ${star.y + starHeight / 2})`}
        />
      ))}

      {/* Gradient and Glow Filter */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={trailColor} stopOpacity="0" />
          <stop offset="100%" stopColor={starColor} stopOpacity="1" />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};
