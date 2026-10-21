import { Navigate, Outlet } from 'react-router-dom';

import { useGymOwnerApproved, useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding';
import { ROUTES } from '@/shared/config/constants';

export function GymOwnerApprovalGuard() {
  const status = useGymOwnerOnboardingStore((state) => state.status);
  const { approved, isChecking } = useGymOwnerApproved();

  if (approved) return <Outlet />;
  if (isChecking) return null;

  const destination = status === 'draft' ? ROUTES.admin.onboarding : ROUTES.admin.onboardingStatus;
  return <Navigate to={destination} replace />;
}
