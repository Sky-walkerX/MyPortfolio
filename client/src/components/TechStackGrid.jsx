"use client";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

const techStack = [
  { name: "React", icon: "/assets/logos/react.svg" },
  { name: "Next.js", icon: "/assets/logos/nextjs.svg" },
  { name: "JavaScript", icon: "/assets/logos/javascript.svg" },
  { name: "TypeScript", icon: "/assets/logos/typescript.svg" },
  { name: "Tailwind CSS", icon: "/assets/logos/tailwindcss.svg" },
  { name: "Three.js", icon: "/assets/logos/threejs.svg" },
  { name: "Go", icon: "/assets/logos/go.svg" },
  { name: "Rust", icon: "/assets/logos/rust.svg" },
  { name: "Python", icon: "/assets/logos/python.svg" },
  { name: "C++", icon: "/assets/logos/cplusplus.svg" },
  { name: "Docker", icon: "/assets/logos/docker.svg" },
  { name: "Git", icon: "/assets/logos/git.svg" },
  { name: "Supabase", icon: "/assets/logos/supabase.svg" },
  { name: "Node.js", icon: "/assets/logos/nodejs.svg" },
  { name: "HTML5", icon: "/assets/logos/html5.svg" },
  { name: "CSS3", icon: "/assets/logos/css3.svg" },
  { name: "Vite", icon: "/assets/logos/vitejs.svg" },
  { name: "GitHub", icon: "/assets/logos/github.svg" },
];

export function TechStackGrid({ className }) {
  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="mb-3 sm:mb-4 lg:mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-[hsl(var(--primary))]">Tech Stack</h3>
        <p className="text-xs sm:text-sm lg:text-base text-[var(--palette-light-purple)] mt-1">
          Languages, frameworks, and tools I work with
        </p>
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-6 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-5 lg:gap-6 xl:gap-8 flex-1 content-center">
        {techStack.map((tech, index) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="group relative flex flex-col items-center gap-2 lg:gap-2.5"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-24 xl:h-24 rounded-xl lg:rounded-2xl bg-white/5 border border-white/10
                          flex items-center justify-center
                          shadow-[0px_0px_8px_0px_rgba(248,248,248,0.15)_inset]
                          group-hover:border-[var(--palette-mid-purple)] group-hover:bg-white/10 
                          group-hover:shadow-[0px_0px_16px_0px_rgba(146,144,195,0.2)]
                          transition-all duration-300"
            >
              <img
                src={tech.icon}
                alt={tech.name}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base font-medium text-[var(--palette-light-purple)] opacity-70 group-hover:opacity-100 transition-opacity duration-200 text-center leading-tight">
              {tech.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
