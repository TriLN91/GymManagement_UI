import type { GymBranchProfile, GymBrandProfile } from '@/features/gym-owner-onboarding';

export type GymProfileBrand = GymBrandProfile;
export type GymProfileBranch = GymBranchProfile;

export interface GymOwnerProfileData {
  isInitialized: boolean;
  brand: GymProfileBrand;
  branches: GymProfileBranch[];
  updatedAt: string | null;
}
