import { lazy, Suspense, useState } from 'react';

import { GymOwnerView } from './components/GymOwnerView';
import { LandingFooter } from './components/LandingFooter';
import { LandingHeader } from './components/LandingHeader';
import { MemberView } from './components/MemberView';

import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

const DesktopLanding = lazy(() =>
  import('@/features/landing').then((m) => ({ default: m.LandingExperience })),
);

export function LandingPage() {
  const desktop = useMediaQuery('(min-width: 1024px)');
  return desktop ? (
    <Suspense
      fallback={
        <div role="status" className="min-h-screen bg-white p-8 text-[#345C32]">
          Đang tải Fit®…
        </div>
      }
    >
      <DesktopLanding />
    </Suspense>
  ) : (
    <MobileLanding />
  );
}

function MobileLanding() {
  const [role, setRole] = useState<'member' | 'gym_owner'>('member');

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingHeader role={role} onRoleChange={setRole} />

      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {role === 'member' ? <MemberView /> : <GymOwnerView />}
      </main>

      <LandingFooter />
    </div>
  );
}
