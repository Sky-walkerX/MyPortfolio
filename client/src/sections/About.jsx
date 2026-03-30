import { BentoGrid, BentoGridItem } from '../components/BentoGrid.jsx';
import { TechStackGrid } from '../components/TechStackGrid.jsx';
import { CodingHeatmaps } from '../components/CodingHeatmaps.jsx';
import { CodingStats } from '../components/CodingStats.jsx';

const About = () => {
  return (
    <section className="c-space my-20 mt-100" id="about">
      <BentoGrid className="h-full">

        {/* Item 1: Personal Intro */}
        <BentoGridItem
          title="Hi, I'm Naman Khandelwal"
          description="A passionate developer who loves turning ideas into clean, functional, and user-friendly web experiences. I enjoy building projects that blend creativity with logic — from responsive UIs to smooth backend integrations."
          header={
            <div className="flex justify-center items-center w-full sm:h-[276px] h-fit" style={{ marginBottom: '80px', marginTop: '55px' }}>
              <img
                src="assets/profile.webp"
                alt="Naman Khandelwal"
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-64 lg:h-64 rounded-full object-cover border-[3px] border-[#535C91] shadow-[0_0_20px_rgba(83,92,145,0.5)]"
              />
            </div>
          }
          contentClassName="p-0"
        />

        {/* Item 2: Extended Tech Stack (spans 2 cols) */}
        <BentoGridItem
          className="md:col-span-2"
          header={
            <div className="p-4 pt-6">
              <TechStackGrid />
            </div>
          }
          contentClassName="p-0"
        />

        {/* Item 3: Codeforces + GitHub Heatmaps (spans 2 cols) */}
        <BentoGridItem
          className="md:col-span-2"
          header={
            <div className="p-5">
              <h3 className="text-lg font-semibold text-[hsl(var(--primary))] mb-1">Coding Activity</h3>
              <p className="text-sm text-[var(--palette-light-purple)] mb-4">Last 6 months of accepted submissions & commits</p>
              <CodingHeatmaps />
            </div>
          }
          contentClassName="p-0"
        />

        {/* Item 4: CP Ratings + GitHub Stats */}
        <BentoGridItem
          header={
            <div className="p-5">
              <h3 className="text-lg font-semibold text-[hsl(var(--primary))] mb-4">Competitive Programming & GitHub</h3>
              <CodingStats />
            </div>
          }
          contentClassName="p-0"
        />
      </BentoGrid>
    </section>
  );
};

export default About;
