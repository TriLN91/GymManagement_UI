import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { GymOwnerProfileData, GymProfileBranch, GymProfileBrand } from './types';

import type { GymOwnerOnboardingData } from '@/features/gym-owner-onboarding';

const PROFILE_STORAGE_KEY = 'gmc.gymOwnerProfile';

const emptyBrand: GymProfileBrand = {
  name: '',
  description: '',
  contactPhone: '',
};

const initialState: GymOwnerProfileData = {
  isInitialized: false,
  brand: emptyBrand,
  branches: [],
  updatedAt: null,
};

interface GymOwnerProfileState extends GymOwnerProfileData {
  initializeFromOnboarding: (source: GymOwnerOnboardingData) => void;
  saveBrand: (brand: GymProfileBrand) => void;
  addBranch: (branch: GymProfileBranch) => void;
  updateBranch: (branch: GymProfileBranch) => void;
  removeBranch: (branchId: string) => void;
  reset: () => void;
}

function cloneBranch(branch: GymProfileBranch): GymProfileBranch {
  return { ...branch, facilities: [...branch.facilities] };
}

export const useGymOwnerProfileStore = create<GymOwnerProfileState>()(
  persist(
    (set) => ({
      ...initialState,
      initializeFromOnboarding: (source) =>
        set((state) => {
          if (state.isInitialized) return state;
          return {
            isInitialized: true,
            brand: { ...source.brand },
            branches: source.branches.map(cloneBranch),
            updatedAt: source.submittedAt ?? new Date().toISOString(),
          };
        }),
      saveBrand: (brand) =>
        set({
          brand: { ...brand },
          isInitialized: true,
          updatedAt: new Date().toISOString(),
        }),
      addBranch: (branch) =>
        set((state) => ({
          branches: [...state.branches, cloneBranch(branch)],
          isInitialized: true,
          updatedAt: new Date().toISOString(),
        })),
      updateBranch: (branch) =>
        set((state) => ({
          branches: state.branches.map((item) =>
            item.id === branch.id ? cloneBranch(branch) : item,
          ),
          updatedAt: new Date().toISOString(),
        })),
      removeBranch: (branchId) =>
        set((state) => {
          if (state.branches.length <= 1) return state;
          return {
            branches: state.branches.filter((branch) => branch.id !== branchId),
            updatedAt: new Date().toISOString(),
          };
        }),
      reset: () =>
        set({
          ...initialState,
          brand: { ...emptyBrand },
          branches: [],
        }),
    }),
    {
      name: PROFILE_STORAGE_KEY,
      version: 1,
    },
  ),
);
