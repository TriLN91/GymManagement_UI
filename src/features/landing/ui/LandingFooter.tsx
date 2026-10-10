import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { LandingAudience } from '../model/types';

import { ROUTES } from '@/shared/config/constants';

export function LandingFooter({
  onAudienceChange,
}: {
  onAudienceChange: (audience: LandingAudience) => void;
}) {
  const { t } = useTranslation('landing');
  return (
    <footer className="fit-footer">
      <div className="fit-footer-top">
        <div>
          <span className="fit-wordmark">
            FIT<sup>®</sup>
          </span>
          <p>{t('footer.tagline')}</p>
        </div>
        <nav aria-label={t('footer.nav')}>
          <button type="button" onClick={() => onAudienceChange('member')}>
            {t('member')}
          </button>
          <button type="button" onClick={() => onAudienceChange('gym_owner')}>
            {t('owner')}
          </button>
          <Link to={ROUTES.public.login}>{t('login')}</Link>
          <Link to={ROUTES.public.register}>{t('footer.register')}</Link>
        </nav>
      </div>
      <div className="fit-footer-bottom fit-label">
        <span>© {new Date().getFullYear()} FIT®</span>
        <span>{t('footer.motto')}</span>
      </div>
    </footer>
  );
}
