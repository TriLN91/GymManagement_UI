import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  BusinessLicenseFile,
  GymBranchProfile,
  GymBrandProfile,
  GymOwnerApplicationStatus,
  GymOwnerOnboardingData,
} from './types';

import { STORAGE_KEYS } from '@/shared/config/constants';

export const EMPTY_BRAND: GymBrandProfile = {
  name: '',
  description: '',
  contactPhone: '',
};

export const createEmptyBranch = (id = 'branch-main'): GymBranchProfile => ({
  id,
  name: '',
  city: '',
  area: '',
  address: '',
  contactPhone: '',
  operatingHours: '',
  facilities: [],
});

export function isBrandProfileComplete(brand: GymBrandProfile) {
  return Boolean(brand.name.trim() && brand.description.trim() && brand.contactPhone.trim());
}

export function isBranchProfileComplete(branch: GymBranchProfile) {
  return Boolean(
    branch.name.trim() &&
    branch.city.trim() &&
    branch.address.trim() &&
    branch.contactPhone.trim() &&
    branch.operatingHours.trim(),
  );
}

export function isBrandAndBranchesComplete(data: GymOwnerOnboardingData) {
  return (
    isBrandProfileComplete(data.brand) &&
    data.branches.length > 0 &&
    data.branches.every(isBranchProfileComplete)
  );
}

interface GymOwnerOnboardingState extends GymOwnerOnboardingData {
  saveBrandAndBranches: (brand: GymBrandProfile, branches: GymBranchProfile[]) => void;
  saveLicense: (license: BusinessLicenseFile) => void;
  removeLicense: () => void;
  submitApplication: () => void;
  resubmitApplication: () => void;
  applyReviewState: (
    status: Extract<GymOwnerApplicationStatus, 'under_review' | 'approved' | 'rejected'>,
    rejectionReason?: string,
  ) => void;
  reset: () => void;
}

const initialState: GymOwnerOnboardingData = {
  brand: EMPTY_BRAND,
  branches: [createEmptyBranch()],
  license: null,
  status: 'draft',
  rejectionReason: null,
  submissionCount: 0,
  submittedAt: null,
};

export const useGymOwnerOnboardingStore = create<GymOwnerOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      saveBrandAndBranches: (brand, branches) =>
        set({
          brand,
          branches,
        }),
      saveLicense: (license) => set({ license }),
      removeLicense: () => set({ license: null }),
      submitApplication: () =>
        set((state) => ({
          status: 'submitted',
          rejectionReason: null,
          submissionCount: state.submissionCount + 1,
          submittedAt: new Date().toISOString(),
        })),
      resubmitApplication: () =>
        set((state) => ({
          status: 'under_review',
          rejectionReason: null,
          submissionCount: state.submissionCount + 1,
          submittedAt: new Date().toISOString(),
        })),
      applyReviewState: (status, rejectionReason) =>
        set({
          status,
          rejectionReason: status === 'rejected' ? rejectionReason?.trim() || null : null,
        }),
      reset: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.gymOwnerOnboarding,
      version: 1,
    },
  ),
);
