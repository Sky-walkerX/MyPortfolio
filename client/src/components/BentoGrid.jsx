import { cn } from "../lib/utils";
import { GlowingEffect } from "../components/GlowingEffect";

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
  contentClassName,
}) => {
  return (
    <div
      className={cn(
        "group/bento row-span-1 rounded-xl border border-neutral-200 bg-white transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-[#040815] dark:shadow-none",
        "relative flex flex-col overflow-hidden",
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
      <div className={cn(
        "relative z-[1] flex flex-col h-full",
        contentClassName
      )}>
        {header && <div className="flex-none">{header}</div>}

        <div className="p-5 flex flex-col justify-start space-y-3 group-hover/bento:translate-x-2 transition duration-200 h-full mt-auto">
          <div>
            {icon}
            {title && (
              <div className="font-sans font-bold text-lg text-neutral-600 dark:text-[hsl(var(--primary))] mt-2">
                {title}
              </div>
            )}
          </div>
          {description && (
            <div className="font-sans text-sm font-normal text-neutral-600 dark:text-[var(--palette-light-purple)] leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
