import { useMutation } from '@tanstack/react-query';

import { syncProfileToBackend } from '../api/fitnessApi';

import type { MemberFitnessProfile } from './profileSetupModel';

export function useSyncFitnessProfile() {
  return useMutation({
    mutationFn: (profile: MemberFitnessProfile) => syncProfileToBackend(profile),
  });
}
