import { lazy, Suspense } from 'react';
import Hero from './sections/Hero.jsx';
import SmoothScroll from './components/SmoothScroll.jsx';

const About = lazy(() => import('./sections/About.jsx'));
const ProjectsSection = lazy(() => import('./sections/Projects.jsx').then(m => ({ default: m.ProjectsSection })));
const BlogsSection = lazy(() => import('./sections/Blogs.jsx').then(m => ({ default: m.BlogsSection })));
const DraggableCardDemo = lazy(() => import('./sections/Achievements.jsx').then(m => ({ default: m.DraggableCardDemo })));
const TimelineDemo = lazy(() => import('./sections/Experience.jsx').then(m => ({ default: m.TimelineDemo })));
const Contact = lazy(() => import('./sections/Contact.jsx'));
const Footer = lazy(() => import('./sections/Footer.jsx'));


const App = () => {
  return (
    <SmoothScroll>
    <main className="mx-auto relative">
      <Hero />
      <Suspense fallback={null}>
        <About />
        <ProjectsSection />
        <BlogsSection />
        <DraggableCardDemo />
        <TimelineDemo />
        <Contact />
        <Footer />
      </Suspense>
    </main>
    </SmoothScroll>
  );
};

export default App;


