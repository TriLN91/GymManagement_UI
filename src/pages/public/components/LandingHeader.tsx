import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

interface LandingHeaderProps {
  role: 'member' | 'gym_owner';
  onRoleChange: (role: 'member' | 'gym_owner') => void;
}

export function LandingHeader({ role, onRoleChange }: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#F3F6F2]">
      <div className="container mx-auto flex h-20 items-center justify-between border-b border-forest/10 px-4">
        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.public.landing}
            className="flex items-center font-syne text-2xl font-bold text-forest"
          >
            FIT<span className="relative -top-2 align-top text-[10px]">®</span>
            <span className="ml-4 hidden rounded-full border border-forest/20 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-widest text-forest/70 sm:inline-block">
              {role === 'member' ? 'FOR MEMBER' : 'FOR GYM OWNER'}
            </span>
          </Link>
        </div>

        <nav className="relative hidden items-center rounded-full border border-forest/10 bg-white/50 p-1 shadow-sm backdrop-blur-sm md:flex">
          <button
            onClick={() => onRoleChange('member')}
            className={`rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${role === 'member' ? 'bg-mint text-forest shadow-sm' : 'text-forest/60 hover:text-forest'}`}
          >
            Khách cá nhân
          </button>
          <button
            onClick={() => onRoleChange('gym_owner')}
            className={`rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${role === 'gym_owner' ? 'bg-mint text-forest shadow-sm' : 'text-forest/60 hover:text-forest'}`}
          >
            Cho Gym Owner
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            asChild
            className="hidden rounded-full font-bold text-forest hover:bg-forest/5 sm:inline-flex"
          >
            <Link to={ROUTES.public.login}>Đăng nhập</Link>
          </Button>
          <Button
            className="rounded-full bg-forest px-6 font-bold text-white hover:bg-forest/90"
            asChild
          >
            <Link to={ROUTES.public.register}>
              {role === 'member' ? 'Bắt đầu tập luyện' : 'Đăng ký đối tác'}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
