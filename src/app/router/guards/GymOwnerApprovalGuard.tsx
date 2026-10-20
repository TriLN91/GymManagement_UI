import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding';
import { marketplaceApi } from '@/features/marketplace';
import { ROUTES } from '@/shared/config/constants';

export function GymOwnerApprovalGuard() {
  const status = useGymOwnerOnboardingStore((state) => state.status);
  const applyReviewState = useGymOwnerOnboardingStore((state) => state.applyReviewState);
  const [checking, setChecking] = useState(status !== 'approved');

  useEffect(() => {
    let cancelled = false;
    if (status === 'approved') {
      setChecking(false);
      return;
    }

    marketplaceApi
      .getMyBrands()
      .then((brands) => {
        if (!cancelled && brands && brands.length > 0) {
          applyReviewState('approved');
        }
      })
      .catch(() => {
        // Fallback to local onboarding store status
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, applyReviewState]);

  if (checking) {
    return null;
  }

  if (status === 'approved') return <Outlet />;

  const destination = status === 'draft' ? ROUTES.admin.onboarding : ROUTES.admin.onboardingStatus;
  return <Navigate to={destination} replace />;
}
