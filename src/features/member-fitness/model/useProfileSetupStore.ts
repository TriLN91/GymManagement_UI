import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { EMPTY_PROFILE, type MemberFitnessProfile } from './profileSetupModel';

interface ProfileSetupState {
  profile: MemberFitnessProfile;
  currentStep: number;
  completed: boolean;
  setProfile: (profile: MemberFitnessProfile) => void;
  setCurrentStep: (step: number) => void;
  completeProfile: () => void;
}

export const useProfileSetupStore = create<ProfileSetupState>()(
  persist(
    (set) => ({
      profile: EMPTY_PROFILE,
      currentStep: 0,
      completed: false,
      setProfile: (profile) => set({ profile }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      completeProfile: () =>
        set((state) => ({
          completed: true,
          profile: { ...state.profile, updatedAt: new Date().toISOString() },
        })),
    }),
    { name: 'fit:member-fitness-profile:v8', version: 8 },
  ),
);
