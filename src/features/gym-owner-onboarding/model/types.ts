export type GymOwnerApplicationStatus =
  'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface GymBrandProfile {
  name: string;
  description: string;
  contactPhone: string;
}

export interface GymBranchProfile {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  contactPhone: string;
  operatingHours: string;
  facilities: string[];
}

export interface BusinessLicenseFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface GymOwnerOnboardingData {
  brand: GymBrandProfile;
  branches: GymBranchProfile[];
  license: BusinessLicenseFile | null;
  status: GymOwnerApplicationStatus;
  rejectionReason: string | null;
  submissionCount: number;
  submittedAt: string | null;
}
