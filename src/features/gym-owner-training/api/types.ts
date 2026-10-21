// Bodies of the backend GymOwnerController trainer/brand endpoints (camelCase JSON, PascalCase enums).
export interface OwnerGymDto {
  id: string;
  name: string;
  approvalStatus: 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended';
}

export interface TrainerAccountDto {
  userId: string;
  trainerProfileId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  gymId: string;
  gymName: string;
  status: 'Active' | 'Disabled' | 'PendingApproval' | 'Rejected';
  yearsOfExperience: number;
  hourlyRate: number | null;
}
