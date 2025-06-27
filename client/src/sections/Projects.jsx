// components/ProjectsSection.jsx
"use client";

import React from 'react';
import { CardContainer, CardBody, CardItem } from '../components/3dCard'; // Adjust path if needed
// Assuming Starfield is used elsewhere or you intend to add it back. It's not currently in the JSX.
// import { Starfield } from '../components/ShootStar';

const projectsData = [
  {
    id: 1,
    title: "Trequila",
    description: "Trequila - Your Trip Planning Companion, plan your perfect trip with Trequila. Discover destinations, create itineraries, and share your adventures.",
    imageUrl: "https://i.ibb.co/bg7WsgSd/Screenshot-2025-06-27-143311.png",
    liveLink: "https://www.trequila.tech/", 
    repoLink: "#", 
    techStack: ["Next.js", "Tailwind CSS", "TypeScript", "MongoDB", "Prisma"],

  },
  {
    id: 2,
    title: "Zonic",
    description: "A web application that integrates with Spotify to play music and podcasts, browse your library, and provides contextual insights like artist news, weather, and related GIFs.",
    imageUrl: "https://i.ibb.co/60m02V7C/Screenshot-2025-05-30-154954.png", 
    liveLink: "https://zonic-frontend-pi.vercel.app",
    repoLink: "https://github.com/Sky-walkerX/Zonic",
    techStack: ["Reactjs", "Tailwind CSS", "ExpressJS", "Node.js", "TypeScript"],
  },
  {
    id: 3,
    title: "Courier-3",
    description: "A next-generation emailing platform designed with a strong emphasis on user privacy and decentralization. Unlike traditional email providers that rely on centralized servers, this application utilizes IPFS (InterPlanetary File System) to store email content, attachments, and metadata in a distributed and tamper-proof manner.",
    imageUrl: "https://i.ibb.co/ZRCXhsh3/Screenshot-2025-05-30-202107.png",
    liveLink: "https://courier3-two.vercel.app/", 
    repoLink: "https://github.com/Aaryan-Dadu/Courier3",
    techStack: ["React", "JavaScript", "TypeScript", "Node.js", "Express", "Pinata"],
  },
  {
    id: 4,
    title: "Personal Portfolio", 
    description: "A stunning personal portfolio website meticulously crafted to showcase skills, projects, and experiences. Built with a focus on performance, elegant aesthetics, and a seamless user experience. Fully responsive design, optimized for search engines, and easily updatable.",
    imageUrl: "https://i.ibb.co/cSbYnMD9/Screenshot-2025-05-30-224455.png",
    liveLink: "https://namankhandelwal.me", 
    repoLink: "https://github.com/Sky-walkerX/MyPortfolio", 
    techStack: ["ThreeJS", "ReactJS", "TailwindCSS", "GSAP", "Framer Motion"],
  },
];

const ProjectContent = ({ title, description, techStack, liveLink, repoLink }) => (
  <div className="flex-1 p-4 md:p-6 text-[var(--text-on-dark)]">
    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
      {title}
    </h3>
    <p className="text-[var(--palette-light-purple)] mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
      {description}
    </p>
    <div className="mb-6 sm:mb-8">
      <h4 className="text-xl font-semibold text-white mb-3">Tech Stack:</h4>
      <div className="flex flex-wrap gap-2">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] text-[var(--palette-light-purple)] px-3 py-1.5 rounded-full text-xs sm:text-sm"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
    <div className="flex flex-wrap gap-3 sm:gap-4">
      {liveLink && liveLink !== "#" && (
        <a
          href={liveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors text-sm sm:text-base"
        >
          View Live
        </a>
      )}
      {repoLink && repoLink !== "#" && (
        <a
          href={repoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg border border-[var(--palette-mid-purple)] text-[var(--palette-light-purple)] font-semibold hover:bg-[var(--palette-dark-purple)] hover:border-[var(--palette-light-purple)] transition-colors text-sm sm:text-base"
        >
          GitHub Repo
        </a>
      )}
      {repoLink == "#" && (
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg border border-[var(--palette-mid-purple)] text-[var(--palette-light-purple)] font-semibold hover:bg-[var(--palette-dark-purple)] hover:border-[var(--palette-light-purple)] transition-colors text-sm sm:text-base"
        >
          Private Repo
        </a>
      )}
    </div>
  </div>
);

export function ProjectsSection() {
  return (
    <section className="bg-[var(--bg-original-dark)] py-16 md:py-24 relative"> {/* Added relative for potential z-index children like Starfield */}
      {/* If you want Starfield as a background for this section specifically: */}
      {/* <div className="absolute inset-0 -z-10"> */}
      {/* <Starfield /> */}
      {/* </div> */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative"> {/* Added relative for z-index context of children */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16 md:mb-24">
          My <span className="text-[hsl(var(--primary))]">Projects</span>
        </h2>
        <div className="space-y-20 md:space-y-28 lg:space-y-32">
          {projectsData.map((project, index) => {
            const isReversed = index % 2 !== 0;

            const projectCard3D = (
              <CardContainer
                className="bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] rounded-xl shadow-2xl
                         w-[280px] h-auto
                         xs:w-[300px] xs:h-[180px] /* Example: smaller aspect ratio for xs */
                         sm:w-[400px] sm:h-[240px] /* Example: slightly larger for sm */
                         md:w-[450px] md:h-[270px] /* Example: for md screens */"
                containerClassName="w-full flex justify-center items-center py-4 md:mt-0" // Removed mt-[45px] for better alignment control via parent
              >
                <CardBody className="w-full h-full">
                  <CardItem
                    as="div"
                    translateZ={60}
                    rotateX={isReversed ? -5 : 5} // Slightly different rotation for variety
                    rotateY={isReversed ? 5 : -5}  // Added Y rotation
                    className="w-full h-full rounded-xl overflow-hidden"
                  >
                    <img
                      src={project.imageUrl}
                      alt={`${project.title} preview`}
                      className="w-full h-full object-cover" // Ensures image covers the CardItem area
                      loading="lazy"
                    />
                  </CardItem>
                </CardBody>
              </CardContainer>
            );

            return (
              <div
                key={project.id}
                className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center md:items-center gap-8 md:gap-12 lg:gap-16`}
              >
                {/* Image Column */}
                <div className="w-full md:w-5/12 lg:w-1/2 flex justify-center items-center"> {/* Centering image card */}
                  {projectCard3D}
                </div>
                {/* Text Content Column */}
                <div className="w-full md:w-7/12 lg:w-1/2 relative z-10"> {/* Ensure text content is above potentially overlapping 3D card parts if pointer-events-none wasn't enough */}
                  <ProjectContent
                    title={project.title}
                    description={project.description}
                    techStack={project.techStack}
                    liveLink={project.liveLink}
                    repoLink={project.repoLink}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}