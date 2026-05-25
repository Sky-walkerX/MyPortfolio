import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
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
import { Topbar } from "@/components/Topbar";

export default function Page() {
  return (
    <>
      <Topbar />
      <main id="top">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Hackathons />
        <Skills />
        <Blogs />
        <Contact />
        <Footer />
      </main>
      <QuickFab />
    </>
  );
}
