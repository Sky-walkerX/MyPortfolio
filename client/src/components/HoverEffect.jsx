import { cn } from "../lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export const HoverEffect = ({ items, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(150px,_auto)] gap-4 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.title}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>

          {/* Render whatever JSX you passed in item.link (e.g. BentoGridItem wrapping CardDemo) */}
          {item.link}
        </div>
      ))}
    </div>
  );
};

// Optional: if you still need Card components for fallback where you render title/description:
export const Card = ({ className, children }) => (
  <div
    className={cn(
      "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20",
      className
    )}
  >
    <div className="relative z-50 p-4">{children}</div>
  </div>
);

export const CardTitle = ({ className, children }) => (
  <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
    {children}
  </h4>
);

export const CardDescription = ({ className, children }) => (
  <p
    className={cn(
      "mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm",
      className
    )}
  >
    {children}
  </p>
);
