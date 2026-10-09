import { Link } from 'react-router-dom';

import type { LandingAudience } from '../model/types';

import { ROUTES } from '@/shared/config/constants';

export function LandingFooter({
  onAudienceChange,
}: {
  onAudienceChange: (audience: LandingAudience) => void;
}) {
  return (
    <footer className="fit-footer">
      <div className="fit-footer-top">
        <div>
          <span className="fit-wordmark">
            FIT<sup>®</sup>
          </span>
          <p>Tập luyện là vận động. AI mang đến sự chính xác.</p>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <button type="button" onClick={() => onAudienceChange('member')}>
            Người tập
          </button>
          <button type="button" onClick={() => onAudienceChange('gym_owner')}>
            Chủ phòng tập
          </button>
          <Link to={ROUTES.public.login}>Đăng nhập</Link>
          <Link to={ROUTES.public.register}>Đăng ký</Link>
        </nav>
      </div>
      <div className="fit-footer-bottom fit-label">
        <span>© {new Date().getFullYear()} FIT®</span>
        <span>CHUYỂN ĐỘNG. DỮ LIỆU. TIẾN BỘ.</span>
      </div>
    </footer>
  );
}
