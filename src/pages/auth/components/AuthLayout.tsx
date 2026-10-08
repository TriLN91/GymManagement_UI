import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#F3F6F2] font-sans">
      {/* Background Graphic Elements */}
      <div className="bg-mint/5 pointer-events-none absolute right-0 top-0 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/3 rounded-full blur-3xl"></div>
      <div className="bg-mint/10 pointer-events-none absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/3 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-8 text-forest md:px-12">
        <Link
          to={ROUTES.public.landing}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-mint"
        >
          <ChevronLeft className="h-4 w-4" /> Quay lại trang chủ
        </Link>
        <div className="text-xs font-bold uppercase tracking-widest text-forest/50">
          FIT CORP // HYER V1.0
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-[420px] flex-col items-center">{children}</div>
      </main>

      {/* Graphic Widget Bottom Left */}
      <div className="absolute bottom-12 left-12 z-10 hidden w-64 rounded-xl border border-forest/10 bg-white/50 p-4 shadow-sm backdrop-blur-sm lg:block">
        <div className="mb-3 flex items-center justify-between border-b border-forest/10 pb-2 text-[10px] font-bold uppercase tracking-wider text-forest/50">
          <span>AI KINEMATICS // DELTA</span>
          <span className="rounded-sm bg-mint px-1.5 py-0.5 text-forest">ACTIVE</span>
        </div>
        <div className="relative flex h-24 w-full items-center justify-center rounded border border-dashed border-forest/20 bg-white/80">
          <div className="absolute left-1/4 top-1/4 h-1.5 w-1.5 rounded-full bg-forest"></div>
          <div className="absolute bottom-1/4 right-1/4 h-1.5 w-1.5 rounded-full bg-mint"></div>
          <div className="absolute right-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-forest"></div>
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <line
              x1="25%"
              y1="25%"
              x2="50%"
              y2="50%"
              stroke="#345C32"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#A7F0DD" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 flex w-full flex-col items-center justify-between gap-4 px-6 py-8 text-[10px] font-bold uppercase tracking-widest text-forest/40 md:flex-row md:px-12">
        <div>FIT® AI FITNESS PLATFORM | HYER SOLUTIONS • PRO TECH ARCHITECTURE</div>
        <div className="flex gap-4">
          <Link to="#" className="transition-colors hover:text-forest">
            Tiêu chuẩn compliance
          </Link>
          <Link to="#" className="transition-colors hover:text-forest">
            Bảo mật sinh trắc học
          </Link>
          <span>© 2026 FIT®</span>
        </div>
      </footer>
    </div>
  );
}
