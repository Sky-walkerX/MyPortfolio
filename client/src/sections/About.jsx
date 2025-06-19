import { useState } from 'react';
import Globe from 'react-globe.gl';
import Button from '../components/Button.jsx';
import { BentoGrid, BentoGridItem } from '../components/BentoGrid.jsx'; // Path to your updated BentoGrid
import { CardDemo } from '../components/Tech.jsx';
import { WithCanvasRevealEffect } from '../components/CanvasWrapper.jsx';
import { cn } from "../lib/utils";
import { Starfield } from '../components/ShootStar.jsx'; // Ensure this path is correct
const About = () => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('namankhandelwal.dev@gmail.com');
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <section className="c-space my-20 mt-100" id="about">
      <BentoGrid className="h-full"> {/* Consider if h-full is needed or if auto-rows is better */}

        {/* Item 1: With Canvas Reveal Effect */}
        

  <BentoGridItem
    
    title="Hi, I’m Naman Khandelwal"
    description="A passionate developer who loves turning ideas into clean, functional, and user-friendly web experiences. I enjoy building projects that blend creativity with logic — from responsive UIs to smooth backend integrations."
    header={
      <img
        src="assets\undraw_dev-productivity_5wps.svg" // Ensure this path is correct
        alt="grid-1"
        className="w-full sm:h-[276px] h-fit object-contain" style={{ marginBottom: '80px', marginTop:'55px' }}
      />
    }
    // Use contentClassName to remove the inner padding of BentoGridItem,
    // because WithCanvasRevealEffect already has p-4.
    contentClassName="p-0"
    // enableGlow can be set to false if the glow should only come from WithCanvasRevealEffect
    // enableGlow={false} // Optional: if WithCanvasRevealEffect provides its own glow that should be primary
  />


        {/* Item 2: Tech Stack */}
        <BentoGridItem
          // enableGlow={false} // Example: if you don't want glow on this one
          header={<CardDemo />}
        />

        {/* Item 3: Global Collaboration */}
        
          <BentoGridItem
            
            title="Global Collaboration"
            description="I thrive in collaborative environments, working with teams across the globe. I believe that diverse perspectives lead to better solutions and innovation. Let's connect and create something amazing together!"
            header={
              <div className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center">
                <Globe
                  height={326}
                  width={326}
                  backgroundColor="rgba(0, 0, 0, 0)"
                  backgroundImageOpacity={0.5}
                  showAtmosphere
                  showGraticules
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                  bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                  // labelsData={[{ lat: 40, lng: -100, text: 'Rijeka, Croatia', color: 'white', size: 15 }]} // This was a sample, adjust to actual location if needed
                  labelsData={[{ lat: 45.3271, lng: 14.4422, text: 'Rijeka, Croatia', color: 'white', size: 15 }]}
                />
              </div>
            }
            icon={<Button name="Contact Me" isBeam containerClass="w-full mt-4" />}
          />
     

        {/* Item 4: My Passion for Coding */}
        <BentoGridItem
          title="My Passion for Coding"
          description="I love solving problems and building things through code. Programming isn't just my profession—it’s my passion. I enjoy exploring new technologies, and enhancing my skills."
          header={
            <img src="assets/grid3.png" alt="grid-3" className="w-full sm:h-[266px] h-fit object-contain" />
          }
          className="md:col-span-2"
        />

        {/* Item 5: Contact me */}
        <BentoGridItem
          title="Contact me"
          description={
            <div className="copy-container cursor-pointer mt-2 flex items-center gap-2" onClick={handleCopy}> {/* Added flex for alignment */}
              <img src={hasCopied ? 'assets/tick.svg' : 'assets/copy.svg'} alt="copy" className="w-5 h-5"/> {/* Added size for copy icon */}
              <p className="lg:text-xl md:text-xl font-medium text-white-100 text-white">
                namankhandelwal.dev@gmail.com
              </p>
            </div>
          }
          header={
            <img
              src="assets\example-animate.svg"
              alt="grid-4"
              className="w-full md:h-[320px] sm:h-[320px] h-fit object-cover sm:object-top"
            />
          }
        />
      </BentoGrid>
      {/* <Starfield className="fixed top-0 left-0 w-screen h-screen z-[-1]" /> */}
    </section>
  );
};

export default About;