import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LandingAudience } from '../model/types';

import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';
import { MemberSections } from './MemberSections';
import { OwnerSections } from './OwnerSections';
import './landing.css';

export function LandingExperience() {
  const { t } = useTranslation('landing');
  const [audience, setAudience] = useState<LandingAudience>('member');
  useEffect(() => {
    const title = document.title;
    document.title = audience === 'member' ? t('titleMember') : t('titleOwner');
    return () => {
      document.title = title;
    };
  }, [audience, t]);
  function changeAudience(next: LandingAudience) {
    setAudience(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return (
    <div className="fit-landing">
      <a className="fit-skip" href="#fit-main">
        {t('skip')}
      </a>
      <LandingHeader audience={audience} onAudienceChange={changeAudience} />
      <main id="fit-main" tabIndex={-1} key={audience}>
        {audience === 'member' ? <MemberSections /> : <OwnerSections />}
      </main>
      <LandingFooter onAudienceChange={changeAudience} />
    </div>
  );
}
