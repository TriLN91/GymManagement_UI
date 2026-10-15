import { describe, expect, it } from 'vitest';

import { encodeRejectionReason, toApprovalRecord } from './mappers';
import type { GymAdminRegistrationDto } from './types';

const dto: GymAdminRegistrationDto = {
  userId: 'c31b1fc0-1efd-4574-b044-1377733b5dbd',
  email: 'boss@gym.vn',
  fullName: 'Gym Boss',
  phoneNumber: null,
  status: 'PendingApproval',
  gymId: 'g-1',
  gymName: 'Iron Gym',
  legalName: null,
  taxCode: '0312345678',
  createdAtUtc: '2026-10-15T08:00:00Z',
};

describe('toApprovalRecord', () => {
  it('maps a pending Gym Admin registration to a gym application', () => {
    const record = toApprovalRecord(dto);
    expect(record).toMatchObject({
      id: dto.userId,
      kind: 'gym_application',
      status: 'pending',
      reference: 'GYM-C31B1FC0',
      organizationName: 'Iron Gym',
      applicantEmail: 'boss@gym.vn',
    });
    expect(record.submission).toEqual([
      { label: 'Tax code', value: '0312345678' },
      { label: 'Gym name', value: 'Iron Gym' },
    ]);
    expect(record.documents).toEqual([]);
  });

  it('maps backend statuses to review statuses', () => {
    expect(toApprovalRecord({ ...dto, status: 'Active' }).status).toBe('approved');
    expect(toApprovalRecord({ ...dto, status: 'Rejected' }).status).toBe('rejected');
  });
});

describe('encodeRejectionReason', () => {
  it('sends the reason code and the trimmed note in one string', () => {
    expect(encodeRejectionReason('documentation_incomplete', '  Missing license ')).toBe(
      '[documentation_incomplete] Missing license',
    );
  });
});
