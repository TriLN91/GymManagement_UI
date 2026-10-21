// Response/request bodies of the backend AdminRegistrationsController (Gym Admin self-registration review).
export type RegistrationStatusDto = 'PendingApproval' | 'Active' | 'Rejected' | 'Disabled';

export interface GymAdminRegistrationDto {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  status: RegistrationStatusDto;
  gymId: string | null;
  gymName: string | null;
  legalName: string | null;
  taxCode: string | null;
  createdAtUtc: string;
}

export interface RegistrationDecisionBody {
  reason?: string;
}
