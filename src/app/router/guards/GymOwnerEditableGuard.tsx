import { Navigate, Outlet } from 'react-router-dom';

import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding';
import { ROUTES } from '@/shared/config/constants';

export function GymOwnerEditableGuard() {
  const status = useGymOwnerOnboardingStore((state) => state.status);
  if (status === 'draft' || status === 'rejected') return <Outlet />;
  return <Navigate to={ROUTES.admin.onboardingStatus} replace />;
}
