import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CanvasRevealEffect } from "../components/CanvasEffect.jsx";

/**
 * @typedef {Object} WithCanvasRevealEffectProps
 * @property {React.ReactNode} children
 * @property {string} [containerClassName]
 * @property {number} [animationSpeed]
 * @property {Array<Array<number>>} [colors]
 * @property {Array<number>} [opacities]
 * @property {number} [dotSize]
 * @property {boolean} [fadeMask] - optional gradient mask
 */

export function WithCanvasRevealEffect({
  children,
  containerClassName = "",
  animationSpeed = 5,
  colors = [
    [59, 130, 246],
    [139, 92, 246],
  ],
  opacities = [0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 1],
  dotSize = 2,
  fadeMask = true,
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative ${containerClassName}`}
    >
      {/* Canvas Effect */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -z-10"
          >
            <CanvasRevealEffect
              animationSpeed={animationSpeed}
              containerClassName="bg-transparent"
              colors={colors}
              opacities={opacities}
              dotSize={dotSize}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Optional fade mask on top of canvas */}
      {fadeMask && (
        <div className="absolute inset-0 pointer-events-none z-0 [mask-image:radial-gradient(400px_at_center,white,transparent)] bg-black/60 dark:bg-black/90" />
      )}

      {/* Actual content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}
