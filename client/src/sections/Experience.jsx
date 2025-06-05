import React from "react";
import { Timeline } from "../components/Timeline"; // Ensure this path is correct

export function TimelineDemo() {
  const data = [
  {
    title: "September 2024",
    content: (
      <div>
        <p className="mb-8 text-lg font-normal text-[var(--palette-light-purple)] md:text-lg">
          Started undergraduate studies in Computer Science at IIIT Lucknow. Explored core areas like competitive programming and web development.
        </p>
      </div>
    ),
  },
  {
    title: "January – May 2025",
    content: (
      <div>
        <p className="mb-8 text-lg font-normal text-[var(--palette-light-purple)] md:text-lg">
          Actively explored open-source contributions, participated in Summer of Bitcoin, and deepened skills in full-stack web development. Began exploring Web3 and foundational concepts in information security.
        </p>
      </div>
    ),
  },
  {
    title: "May – August 2025",
    content: (
      <div>
        <p className="mb-8 text-lg font-normal text-[var(--palette-light-purple)] md:text-lg">
          Working on personal and collaborative projects involving Spotify integration, decentralized applications using IPFS, and building full-stack apps with privacy-focused features. Continued learning in blockchain and cybersecurity.
        </p>
      </div>
    ),
  },
];

  return (
    // Wrap in a section for semantic meaning and consistent theming
    <section className="bg-transparent py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8"> {/* Optional: for consistent padding */}
        
        <div className="relative w-full overflow-clip">
          {/* 
            The Timeline component itself might have props for:
            - activeColor (e.g., var(--palette-light-purple) or hsl(var(--primary)))
            - lineColor (e.g., var(--palette-mid-purple))
            - dotColor (e.g., var(--palette-mid-purple))
            - titleColor (e.g., var(--text-on-dark))
            - contentColor (this is what we're primarily setting below)
            Check the Timeline component's documentation/props.
          */}
          <Timeline data={data} />
        </div>
      </div>
    </section>
  );
}