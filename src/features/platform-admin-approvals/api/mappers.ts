import type {
  PlatformApprovalRecord,
  PlatformApprovalStatus,
  RejectionReason,
} from '../model/types';

import type { GymAdminRegistrationDto } from './types';

const STATUS: Readonly<Record<GymAdminRegistrationDto['status'], PlatformApprovalStatus>> = {
  PendingApproval: 'pending',
  Active: 'approved',
  Rejected: 'rejected',
  // A disabled account was approved once and later suspended; it is not waiting for review.
  Disabled: 'approved',
};

export function encodeRejectionReason(reason: RejectionReason, note: string): string {
  return `[${reason}] ${note.trim()}`;
}

const line = (label: string, value: string | null | undefined) => (value ? [{ label, value }] : []);

/** Maps a backend registration into the record shape used by the approval pages. */
export function toApprovalRecord(dto: GymAdminRegistrationDto): PlatformApprovalRecord {
  const status = STATUS[dto.status];
  return {
    id: dto.userId,
    kind: 'gym_application',
    reference: `GYM-${dto.userId.slice(0, 8).toUpperCase()}`,
    applicantName: dto.fullName,
    applicantEmail: dto.email,
    organizationName: dto.gymName ?? undefined,
    submittedAt: dto.createdAtUtc,
    status,
    identity: [
      { label: 'Applicant', value: dto.fullName },
      { label: 'Email', value: dto.email },
      ...line('Phone', dto.phoneNumber),
      ...line('Gym', dto.gymName),
    ],
    submission: [
      ...line('Legal name', dto.legalName),
      ...line('Tax code', dto.taxCode),
      ...line('Gym name', dto.gymName),
    ],
    // The backend does not store documents yet.
    documents: [],
    timeline: [
      { id: `submitted-${dto.userId}`, at: dto.createdAtUtc, label: 'Application submitted' },
    ],
  };
}
