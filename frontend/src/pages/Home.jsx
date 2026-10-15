import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import MeetGuides from '../components/home/MeetGuides';
import Tools from '../components/home/Tools';
import ReportPreview from '../components/home/ReportPreview';
import Testimonials from '../components/home/Testimonials';
import CtaBanner from '../components/home/CtaBanner';

const Home = () => {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <MeetGuides />
      <Tools />
      <ReportPreview />
      <Testimonials />
      <CtaBanner />
    </main>
  );
};

export default Home;
