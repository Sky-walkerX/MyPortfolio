import { BootSequence } from "@/components/BootSequence";
import { CommandPalette } from "@/components/CommandPalette";
import { Footer } from "@/components/Footer";
import { GlobalEffects } from "@/components/GlobalEffects";
import { Hero } from "@/components/Hero";
import { Matrix } from "@/components/Matrix";
import { ProjectModal } from "@/components/ProjectModal";
import { QuickFab } from "@/components/QuickFab";
import {
  About,
  Blogs,
  Contact,
  Experience,
  Hackathons,
  Projects,
  Skills,
} from "@/components/Sections";
import { Snake } from "@/components/Snake";
import { Stats } from "@/components/Stats";
import { Topbar } from "@/components/Topbar";
import { Tweaks } from "@/components/Tweaks";

export const revalidate = 3600;

export default function Page() {
  return (
    <>
      <BootSequence />
      <Topbar />
      <main id="top">
        <Hero />
        <About />
        <Experience />
        <Stats />
        <Projects />
        <Hackathons />
        <Skills />
        <Blogs />
        <Contact />
        <Footer />
      </main>
      <QuickFab />
      <CommandPalette />
      <ProjectModal />
      <Snake />
      <Matrix />
      <Tweaks />
      <GlobalEffects />
    </>
  );
}
