export const TRAINER_SPECIALIZATIONS = [
  'strength',
  'hypertrophy',
  'fat_loss',
  'movement',
  'mobility',
  'endurance',
  'rehabilitation',
] as const;

export type TrainerSpecialization = (typeof TRAINER_SPECIALIZATIONS)[number];
export type TrainerApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type TrainerOperationalStatus = 'active' | 'hidden' | 'suspended' | 'unlinked';

export interface GymTrainerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  specializations: TrainerSpecialization[];
  experienceYears: number;
  selfIntroduction: string;
  avatarDataUrl: string | null;
  approvalStatus: TrainerApprovalStatus;
  operationalStatus: TrainerOperationalStatus | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  createdAt: string;
}

export type GymTrainerInput = Pick<
  GymTrainerProfile,
  | 'fullName'
  | 'email'
  | 'phone'
  | 'bio'
  | 'specializations'
  | 'experienceYears'
  | 'selfIntroduction'
  | 'avatarDataUrl'
>;

export interface GymTrainerAssignment {
  id: string;
  memberName: string;
  memberEmail: string;
  packageName: string;
  trainerId: string;
  startsOn: string;
  endsOn: string;
  status: 'active' | 'historical';
}

export type AssignmentExceptionReason = 'trainerUnavailable' | 'activationFailed';

export interface GymAssignmentException {
  id: string;
  memberName: string;
  memberEmail: string;
  packageName: string;
  originalTrainerId: string;
  reason: AssignmentExceptionReason;
  status: 'open' | 'resolved';
  replacementTrainerId: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface LocalizedPackageText {
  en: string;
  vi: string;
}

export interface GymPTPackage {
  id: string;
  trainerId: string;
  name: LocalizedPackageText;
  sessionsIncluded: number;
  durationDays: number;
  servicePriceVnd: number;
  features: LocalizedPackageText[];
  publicationStatus: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export type GymPTPackageInput = Pick<
  GymPTPackage,
  'trainerId' | 'name' | 'sessionsIncluded' | 'durationDays' | 'servicePriceVnd' | 'features'
>;

export type ManagementDataState = 'loading' | 'loaded' | 'empty' | 'error';
