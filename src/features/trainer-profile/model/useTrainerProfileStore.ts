import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TrainerProfileData {
  phone: string;
  bio: string;
  specializations: string[];
  experienceYears: number | null;
  selfIntroduction: string;
  avatarDataUrl: string | null;
}

interface TrainerProfileState {
  profile: TrainerProfileData;
  isProfileComplete: boolean;
  updateProfile: (profile: TrainerProfileData) => void;
  setIsProfileComplete: (isComplete: boolean) => void;
}

export const useTrainerProfileStore = create<TrainerProfileState>()(
  persist(
    (set) => ({
      profile: {
        phone: '+84 908 221 745',
        bio: 'Strength and movement coach focused on sustainable progress, safe technique and clear training decisions.',
        specializations: ['strength', 'hypertrophy', 'movement'],
        experienceYears: 7,
        selfIntroduction:
          'I help members understand why each exercise belongs in their plan and how to progress without sacrificing movement quality.',
        avatarDataUrl: null,
      },
      isProfileComplete: true,
      updateProfile: (profile) =>
        set({
          profile,
          isProfileComplete:
            Boolean(profile.phone?.trim()) &&
            Boolean(profile.bio?.trim()) &&
            (profile.experienceYears ?? 0) > 0,
        }),
      setIsProfileComplete: (isProfileComplete) => set({ isProfileComplete }),
    }),
    { name: 'fit:trainer-profile:v2', version: 2 },
  ),
);
