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
      <div className="container mx-auto px-4 flex h-20 items-center justify-between border-b border-forest/10">
        <div className="flex items-center gap-2">
          <Link to={ROUTES.public.landing} className="font-syne text-2xl font-bold text-forest flex items-center">
            FIT<span className="text-[10px] align-top relative -top-2">®</span>
            <span className="ml-4 border border-forest/20 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold text-forest/70 uppercase tracking-widest hidden sm:inline-block">
              {role === 'member' ? 'FOR MEMBER' : 'FOR GYM OWNER'}
            </span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center p-1 bg-white/50 backdrop-blur-sm rounded-full border border-forest/10 shadow-sm relative">
          <button 
            onClick={() => onRoleChange('member')}
            className={`text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full transition-colors ${role === 'member' ? 'bg-mint text-forest shadow-sm' : 'text-forest/60 hover:text-forest'}`}
          >
            Khách cá nhân
          </button>
          <button 
            onClick={() => onRoleChange('gym_owner')}
            className={`text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full transition-colors ${role === 'gym_owner' ? 'bg-mint text-forest shadow-sm' : 'text-forest/60 hover:text-forest'}`}
          >
            Cho Gym Owner
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex text-forest font-bold hover:bg-forest/5 rounded-full">
            <Link to={ROUTES.public.login}>Đăng nhập</Link>
          </Button>
          <Button className="bg-forest text-white hover:bg-forest/90 rounded-full font-bold px-6" asChild>
            <Link to={ROUTES.public.register}>{role === 'member' ? 'Bắt đầu tập luyện' : 'Đăng ký đối tác'}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
