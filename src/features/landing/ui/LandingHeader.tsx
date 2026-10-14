import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { LandingAudience } from '../model/types';

import { LandingButton } from './LandingButton';

import { ROUTES } from '@/shared/config/constants';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';

export function LandingHeader({
  audience,
  onAudienceChange,
}: {
  audience: LandingAudience;
  onAudienceChange: (next: LandingAudience) => void;
}) {
  const { t } = useTranslation('landing');
  return (
    <header className="fit-header">
      <Link to={ROUTES.public.landing} className="fit-wordmark" aria-label={t('homeAria')}>
        FIT<sup>®</sup>
      </Link>
      <nav aria-label={t('audienceNav')} className="fit-audience">
        <button
          type="button"
          aria-pressed={audience === 'member'}
          onClick={() => onAudienceChange('member')}
        >
          {t('member')}
        </button>
        <button
          type="button"
          aria-pressed={audience === 'gym_owner'}
          onClick={() => onAudienceChange('gym_owner')}
        >
          {t('owner')}
        </button>
      </nav>
      <div className="fit-header-actions">
        <LanguageSwitcher variant="pill" />
        <Link to={ROUTES.public.login}>{t('login')}</Link>
        <LandingButton to={ROUTES.public.register}>
          {audience === 'member' ? t('ctaMember') : t('ctaOwner')}
        </LandingButton>
      </div>
    </header>
  );
}
