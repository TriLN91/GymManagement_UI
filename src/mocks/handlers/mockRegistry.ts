// In-memory state shared by the MSW handlers that mimic the backend registration/approval flow
// (identity register/gym-admin -> admin registrations -> gym-owner trainers). Reset on page reload.
export type MockRegistrationStatus = 'PendingApproval' | 'Active' | 'Rejected';

export interface MockGymAdminRegistration {
  userId: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string | null;
  gymId: string;
  gymName: string;
  legalName: string | null;
  taxCode: string | null;
  status: MockRegistrationStatus;
  createdAtUtc: string;
  rejectionReason?: string;
}

export interface MockTrainerAccount {
  userId: string;
  trainerProfileId: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string | null;
  gymId: string;
  gymName: string;
  yearsOfExperience: number;
  hourlyRate: number | null;
}

export const gymAdminRegistry: MockGymAdminRegistration[] = [
  {
    userId: '5b0b0c1e-0000-4000-8000-000000001042',
    email: 'm.nguyen@northstar.fit',
    password: 'Password1!',
    fullName: 'Minh Nguyen',
    phoneNumber: '0901234567',
    gymId: '5b0b0c1e-0000-4000-8000-00000000a042',
    gymName: 'Northstar Fitness',
    legalName: 'Northstar Fitness Joint Stock Company',
    taxCode: '0318456721',
    status: 'PendingApproval',
    createdAtUtc: '2026-10-07T08:20:00.000Z',
  },
];

// Approved sample owner (owner@demo.gym) so the trainer-account flow can be exercised without a review round trip.
gymAdminRegistry.push({
  userId: '5b0b0c1e-0000-4000-8000-000000002001',
  email: 'owner@demo.gym',
  password: 'Password1!',
  fullName: 'Olivia Owner',
  phoneNumber: null,
  gymId: '5b0b0c1e-0000-4000-8000-00000000b001',
  gymName: 'Demo Fitness Club',
  legalName: null,
  taxCode: null,
  status: 'Active',
  createdAtUtc: '2026-10-01T08:00:00.000Z',
});

export const trainerRegistry: MockTrainerAccount[] = [];

export const findRegistration = (userId: string) =>
  gymAdminRegistry.find((item) => item.userId === userId);

export const emailTaken = (email: string) =>
  gymAdminRegistry.some((item) => item.email === email) ||
  trainerRegistry.some((item) => item.email === email);
