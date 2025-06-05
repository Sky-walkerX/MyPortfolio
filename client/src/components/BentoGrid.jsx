// ../components/BentoGrid.jsx (or your path)
import { cn } from "../lib/utils";
import { GlowingEffect } from "../components/GlowingEffect"; // Or your correct path

export const BentoGrid = ({
  className,
  children
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3 auto-rows-auto",
        className
      )}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  enableGlow = true,
  glowSpread = 40,
  glowProximity = 64,
  glowInactiveZone = 0.01,
  contentClassName, // Prop to customize padding/styles of the content wrapper
}) => {
  return (
    <div
      className={cn(
        "group/bento row-span-1 rounded-xl border border-neutral-200 bg-white transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-[#040815] dark:shadow-none",
        "relative flex flex-col ", // Ensures this root div is a flex container
        className
      )}
    >
      {enableGlow && (
        <GlowingEffect
          spread={glowSpread}
          glow={true}
          disabled={false}
          proximity={glowProximity}
          inactiveZone={glowInactiveZone}
        />
      )}
      {/* Content wrapper - this div handles padding and overall content flow */}
      <div className={cn(
        "relative z-[1] flex flex-col grow p-4 space-y-4", // Use `grow` to take available space, default padding p-4
        contentClassName // Allows overriding default padding (e.g., to p-0)
      )}>
        {header && <div className="flex-none">{header}</div>} {/* Ensure header doesn't shrink */}

        {/* Text content container - make this a flex column that can grow and push description down */}
        <div className="p-5 flex flex-col grow justify-between space-y-2 group-hover/bento:translate-x-2 transition duration-200">
          <div> {/* Top part of text content: icon and title */}
            {icon}
            <div className=" position-relative  mt-2 -bottom-5  font-sans font-bold text-neutral-600 dark:text-[hsl(var(--primary))]">
              {title}
            </div>
          </div>
          {description && (
            <div className=" position-relative bottom-10 font-sans text-sm font-normal text-neutral-600 dark:text-[var(--palette-light-purple)]">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};