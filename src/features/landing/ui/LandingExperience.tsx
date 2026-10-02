import { useEffect, useRef, useState } from 'react';

import type { LandingAudience } from '../model/types';
import { useLandingScroll } from '../model/useLandingScroll';


import { HeroExperience } from './HeroExperience';
import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';
import { MemberSections } from './MemberSections';
import { OwnerSections } from './OwnerSections';
import './landing.css';
export function LandingExperience() {
  const [audience, setAudience] = useState<LandingAudience>('member');
  const root = useRef<HTMLDivElement>(null);
  useLandingScroll(root, audience);
  useEffect(() => {
    const title = document.title;
    const language = document.documentElement.lang;
    document.documentElement.lang = 'vi';
    document.title =
      audience === 'member' ? 'Fit® — Tập luyện có định hướng' : 'Fit® — Dành cho chủ phòng tập';
    return () => {
      document.title = title;
      document.documentElement.lang = language;
    };
  }, [audience]);
  function changeAudience(next: LandingAudience) {
    setAudience(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return (
    <div ref={root} className="fit-landing">
      <a className="fit-skip" href="#fit-main">
        Đến nội dung chính
      </a>
      <LandingHeader audience={audience} onAudienceChange={changeAudience} />
      <main id="fit-main" tabIndex={-1} key={audience}>
        {audience === 'member' ? (
          <>
            <HeroExperience />
            <MemberSections />
          </>
        ) : (
          <OwnerSections />
        )}
      </main>
      <LandingFooter onAudienceChange={changeAudience} />
    </div>
  );
}
