import { useEffect } from 'react';

import { useGymOwnerProfileStore } from '../model/useGymOwnerProfileStore';

import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding';

export function useGymProfileBootstrap() {
  const onboarding = useGymOwnerOnboardingStore();
  const isInitialized = useGymOwnerProfileStore((state) => state.isInitialized);
  const initialize = useGymOwnerProfileStore((state) => state.initializeFromOnboarding);

  useEffect(() => {
    if (!isInitialized) initialize(onboarding);
  }, [initialize, isInitialized, onboarding]);
}
