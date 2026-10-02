import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6F2] relative overflow-hidden font-sans">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-mint/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-mint/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10 w-full px-6 md:px-12 py-8 flex justify-between items-center text-forest">
        <Link to={ROUTES.public.landing} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-mint transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lại trang chủ
        </Link>
        <div className="text-xs font-bold uppercase tracking-widest text-forest/50">
          FIT CORP // HYER V1.0
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-12">
        <div className="w-full max-w-[420px] flex flex-col items-center">
          {children}
        </div>
      </main>

      {/* Graphic Widget Bottom Left */}
      <div className="hidden lg:block absolute bottom-12 left-12 bg-white/50 backdrop-blur-sm border border-forest/10 p-4 rounded-xl shadow-sm z-10 w-64">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-forest/50 mb-3 border-b border-forest/10 pb-2">
          <span>AI KINEMATICS // DELTA</span>
          <span className="bg-mint text-forest px-1.5 py-0.5 rounded-sm">ACTIVE</span>
        </div>
        <div className="relative h-24 w-full flex items-center justify-center border border-dashed border-forest/20 rounded bg-white/80">
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-forest"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-mint"></div>
          <div className="absolute top-1/2 right-1/2 w-1.5 h-1.5 rounded-full bg-forest"></div>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#345C32" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#A7F0DD" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-forest/40 gap-4">
        <div>
          FIT® AI FITNESS PLATFORM | HYER SOLUTIONS • PRO TECH ARCHITECTURE
        </div>
        <div className="flex gap-4">
          <Link to="#" className="hover:text-forest transition-colors">Tiêu chuẩn compliance</Link>
          <Link to="#" className="hover:text-forest transition-colors">Bảo mật sinh trắc học</Link>
          <span>© 2026 FIT®</span>
        </div>
      </footer>
    </div>
  );
}
