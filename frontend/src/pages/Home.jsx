import { MotionConfig, motion, useScroll, useSpring } from 'framer-motion';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import MeetGuides from '../components/home/MeetGuides';
import Tools from '../components/home/Tools';
import ReportPreview from '../components/home/ReportPreview';
import Testimonials from '../components/home/Testimonials';
import CtaBanner from '../components/home/CtaBanner';

// Thin bar across the top of the window that tracks how far down the page you are
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-accent-bright"
      style={{ scaleX }}
    />
  );
};

const Home = () => {
  return (
    // "user" keeps fades but drops movement for visitors who prefer reduced motion
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <main>
        <Hero />
        <HowItWorks />
        <MeetGuides />
        <Tools />
        <ReportPreview />
        <Testimonials />
        <CtaBanner />
      </main>
    </MotionConfig>
  );
};

export default Home;
