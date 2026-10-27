import { Features } from '@/components/landing/features';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Roadmap } from '@/components/landing/roadmap';

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Roadmap />
    </>
  );
}
