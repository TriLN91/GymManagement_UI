import { Navigate, Outlet } from 'react-router-dom';

import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding';
import { ROUTES } from '@/shared/config/constants';

export function GymOwnerApprovalGuard() {
  const status = useGymOwnerOnboardingStore((state) => state.status);

  if (status === 'approved') return <Outlet />;

  const destination = status === 'draft' ? ROUTES.admin.onboarding : ROUTES.admin.onboardingStatus;
  return <Navigate to={destination} replace />;
}
