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
    {
      name: 'fit:member-fitness-profile:v8',
      version: 9,
      // v9 dropped the cardio/strength/equipment/location/exercise-preference fields and the recovery
      // step (the review became step 5). Keep what the member already typed; drop the removed keys.
      migrate: (persisted, version) => {
        const state = persisted as Partial<ProfileSetupState> | undefined;
        if (!state || version >= 9) return persisted as ProfileSetupState;
        const old = (state.profile ?? {}) as Partial<MemberFitnessProfile>;
        const training = (old.training ?? {}) as Partial<MemberFitnessProfile['training']>;
        return {
          ...state,
          currentStep: Math.min(state.currentStep ?? 0, 5),
          profile: {
            ...EMPTY_PROFILE,
            identity: { ...EMPTY_PROFILE.identity, ...old.identity },
            goals: { ...EMPTY_PROFILE.goals, ...old.goals },
            movement: { ...EMPTY_PROFILE.movement, ...old.movement },
            training: {
              experience: training.experience ?? '',
              availableDays: training.availableDays ?? [],
              sessionMinutes: training.sessionMinutes ?? null,
            },
            consent: { ...EMPTY_PROFILE.consent, ...old.consent },
            updatedAt: old.updatedAt ?? null,
          },
        } as ProfileSetupState;
      },
    },
  ),
);
