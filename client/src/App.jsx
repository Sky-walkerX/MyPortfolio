import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Footer from './sections/Footer.jsx';
import Navbar from './sections/Navbar.jsx';
import Contact from './sections/Contact.jsx';
import  { DraggableCardDemo } from './sections/Achievements.jsx';
import {ProjectsSection} from './sections/Projects.jsx';
import {TimelineDemo} from './sections/Experience.jsx';
import { CardDemo } from './components/Tech.jsx';
import SmoothScroll from './components/SmoothScroll.jsx';


const App = () => {
  return (
    <SmoothScroll>
    <main className=" mx-auto relative">
      {/* <Navbar /> */}
      <Hero />
      <About />
      {/* <CardDemo /> */}
    <ProjectsSection />
      <DraggableCardDemo/>
      <TimelineDemo />
      <Contact />
      <Footer />
    </main>
    </SmoothScroll>
  );
};

export default App;


