import { Link } from 'react-router-dom';

import type { LandingAudience } from '../model/types';

import { LandingButton } from './LandingButton';

import { ROUTES } from '@/shared/config/constants';

export function LandingHeader({
  audience,
  onAudienceChange,
}: {
  audience: LandingAudience;
  onAudienceChange: (next: LandingAudience) => void;
}) {
  return (
    <header className="fit-header">
      <Link to={ROUTES.public.landing} className="fit-wordmark" aria-label="Fit — Trang chủ">
        FIT<sup>®</sup>
      </Link>
      <nav aria-label="Đối tượng khách hàng" className="fit-audience">
        <button
          type="button"
          aria-pressed={audience === 'member'}
          onClick={() => onAudienceChange('member')}
        >
          Người tập
        </button>
        <button
          type="button"
          aria-pressed={audience === 'gym_owner'}
          onClick={() => onAudienceChange('gym_owner')}
        >
          Chủ phòng tập
        </button>
      </nav>
      <div className="fit-header-actions">
        <Link to={ROUTES.public.login}>Đăng nhập</Link>
        <LandingButton to={ROUTES.public.register}>
          {audience === 'member' ? 'Bắt đầu tập luyện' : 'Đăng ký đối tác'}
        </LandingButton>
      </div>
    </header>
  );
}
