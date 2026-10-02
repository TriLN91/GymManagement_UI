import { ArrowUp } from 'lucide-react';
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
        <p>
          Tập luyện là vận động.
          <br />
          AI mang đến sự chính xác.
        </p>
        <nav aria-label="Liên kết cuối trang">
          <button onClick={() => onAudienceChange('member')}>Người tập</button>
          <button onClick={() => onAudienceChange('gym_owner')}>Chủ phòng tập</button>
          <Link to={ROUTES.public.login}>Đăng nhập</Link>
          <Link to={ROUTES.public.register}>Đăng ký</Link>
        </nav>
        <button
          className="fit-back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
          aria-label="Về đầu trang"
        >
          <ArrowUp />
        </button>
      </div>
      <div className="fit-footer-brand" aria-hidden="true">
        FIT<sup>®</sup>
      </div>
      <div className="fit-footer-bottom fit-label">
        <span>© {new Date().getFullYear()} FIT®</span>
        <span>CHUYỂN ĐỘNG. DỮ LIỆU. TIẾN BỘ.</span>
      </div>
    </footer>
  );
}
