import React from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "../components/DragCard.jsx"; // Ensure this path is correct
import { Starfield } from "../components/ShootStar.jsx"; // Ensure this path is correct

export function DraggableCardDemo() {
  const itemsWithDescription = [
    // ... (your items array with titles, images, descriptions, and classNames)
    {
      title: "Incognito CTF",
      image:
        "MyPortfolio/client/public/assets/achievements/ctf.jpeg",
      className: "absolute top-10 left-[20%] rotate-[-5deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "Secured 1st position in the college in the global Capture The Flag competition.",
    },
    {
      title: "HacktoberFest",
      image:
        "https://doimages.nyc3.cdn.digitaloceanspaces.com/002Blog/DO-Hacktoberfest-2024-BlogHeader1100x640.png",
      className: "absolute top-32 left-[55%] rotate-[10deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "Successfully contributed to several open-source projects during HacktoberFest.",
    },
    {
      title: "Summer of Bitcoin",
      image:
        "https://bitbo.io/news/images/summer-of-btc.png",
      className: "absolute top-20 right-[35%] rotate-[2deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "Participated in the prestigious Summer of Bitcoin program and qualified upto proposal round.",
    },
    {
      title: "Freshers Cup",
      image:
        "https://yxxshin.github.io/images/CodeForces_Cover.jpg",
      className: "absolute top-24 left-[45%] rotate-[-7deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "Won the Freshers Cup intra-college competitive programming team competition.",
    },
    {
      title: "Hackofiesta 6.1",
      image:
        "https://www.serpro.gov.br/menu/noticias/noticias-2022/hackathon-web3/@@images/image/large",
      className: "absolute top-8 left-[30%] rotate-[4deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "Made courier-3 project in Hackofiesta 6.1, a hackathon organized by the college.",
    },
    {
      title: "Google CTF",
      image:
        "MyPortfolio/client/public/assets/achievements/googlectf.gif",
      className: "absolute top-40 right-[25%] rotate-[-3deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "Solved 2 CTFs in Google CTF 2025, a prestigious global cybersecurity competition.",
    },
    {
      title: "Flipkart Grid 7.0",
      image: 
        "MyPortfolio/client/public/assets/achievements/FlipkartGrid.jpg",
      className: "absolute top-32 left-[25%] rotate-[6deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "Solved 2 out of 3 questions in Flipkart Grid 7.0, a competitive coding event by Flipkart.",
    },
    {
      title: "Odoo Hackathon",
      image:
        "MyPortfolio/client/public/assets/achievements/odoo.jpg",
      className: "absolute top-16 right-[20%] rotate-[-4deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "Qualified for the finals in Odoo Hackathon 2025 by building skill-swap platform",
    },
    {
      title: "Competitive Programming",
      image: 
        "https://yxxshin.github.io/images/CodeForces_Cover.jpg",
      className: "absolute top-48 left-[40%] rotate-[5deg] w-72 p-4 bg-[var(--palette-dark-purple)] rounded-lg shadow-xl",
      description: "800+ Problems solved on Codeforces, CSES, and CodeChef combined with a rating of 1327 on CF and 3 star on CodeChef.",
    }
  ];

  return (
    <section className="bg-[var(--bg-original-dark)] py-12 md:py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--text-on-dark)] mb-10 md:mb-16">
        Major <span className="text-[hsl(var(--primary))]">Achievements</span>
      </h2>
      <DraggableCardContainer
        className="relative flex min-h-screen w-[90%] mx-auto items-center justify-center overflow-clip border border-[var(--palette-mid-purple)] rounded-md"
      >
        <Starfield />
        
        <p
          className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-black text-[var(--palette-light-purple)] md:text-4xl z-0"
        >
          Many more achievements to come!
        </p>
        {itemsWithDescription.map((item, index) => (
          <DraggableCardBody key={index} className={item.className}>
            <div className="relative h-40 w-full rounded-t-md overflow-hidden mb-3">
              <img
                src={item.image}
                alt={item.title}
                className="pointer-events-none absolute top-0 left-0 w-full h-full object-cover" // Changed to object-cover
              />
            </div>
            <h3
              className="text-center text-lg font-bold text-[var(--palette-light-purple)] px-2"
            >
              {item.title}
            </h3>
            <p
              className="mt-1 mb-2 text-center text-sm text-[var(--palette-light-purple)] opacity-80 px-2"
            >
              {item.description}
            </p>
          </DraggableCardBody>
        ))}
      </DraggableCardContainer>
    </section>
  );
}