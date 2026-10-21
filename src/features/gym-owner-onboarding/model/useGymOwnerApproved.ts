import { useGymOwnerOnboardingStore } from './useGymOwnerOnboardingStore';

import { useMyGyms } from '@/features/gym-owner-training';

/**
 * Whether the signed-in Gym Admin may use the partner portal.
 *
 * Two sources count as approval: the local onboarding flow (status 'approved'), and a gym that a
 * Platform Admin already approved in the backend. A Gym Admin who registered through the real flow
 * could only sign in after that review, so they never repeat the local onboarding.
 */
export function useGymOwnerApproved() {
  const localStatus = useGymOwnerOnboardingStore((state) => state.status);
  // Skip the request when the local flow already approved: nothing to learn, and no extra call.
  const myGyms = useMyGyms(localStatus !== 'approved');
  const backendApproved = myGyms.data?.some((gym) => gym.approvalStatus === 'Approved') ?? false;
  const approved = localStatus === 'approved' || backendApproved;
  return {
    approved,
    // True until the backend answer is known, so guards do not redirect to onboarding too early.
    isChecking: !approved && myGyms.isPending,
  };
}
