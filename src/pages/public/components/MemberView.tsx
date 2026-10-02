import { AISection } from './AISection';
import { GymsSection } from './GymsSection';
import { HeroSection } from './HeroSection';
import { MemberDarkSection } from './MemberDarkSection';
import { ProcessSection } from './ProcessSection';

export function MemberView() {
  return (
    <>
      <HeroSection />
      <AISection />
      <GymsSection />
      <ProcessSection />
      <MemberDarkSection />
    </>
  );
}
