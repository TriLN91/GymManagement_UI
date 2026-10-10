import { beforeEach, describe, expect, it } from 'vitest';

import { initialPlatformAccounts, initialPlatformApprovals } from './mockData';
import { usePlatformApprovalStore } from './store';

describe('Platform approval store', () => {
  beforeEach(() => {
    usePlatformApprovalStore.setState({
      approvals: initialPlatformApprovals,
      accounts: initialPlatformAccounts,
      audit: [],
    });
  });

  it('approves a submitted record and creates structured audit evidence', () => {
    usePlatformApprovalStore.getState().approve('gym-1042');

    expect(
      usePlatformApprovalStore.getState().approvals.find((item) => item.id === 'gym-1042'),
    ).toMatchObject({ status: 'approved' });
    expect(usePlatformApprovalStore.getState().audit[0]).toMatchObject({
      action: 'approval_approved',
      subjectType: 'approval',
      subjectId: 'gym-1042',
      metadata: { approvalKind: 'gym_application' },
    });
  });

  it('requires the caller to provide rejection evidence and records it as structured data', () => {
    usePlatformApprovalStore
      .getState()
      .reject('trainer-2041', 'documentation_incomplete', 'Please add the current certificate.');

    expect(
      usePlatformApprovalStore.getState().approvals.find((item) => item.id === 'trainer-2041'),
    ).toMatchObject({
      status: 'rejected',
      rejection: {
        reason: 'documentation_incomplete',
        note: 'Please add the current certificate.',
      },
    });
    expect(usePlatformApprovalStore.getState().audit[0]?.metadata).toMatchObject({
      rejectionReason: 'documentation_incomplete',
      note: 'Please add the current certificate.',
    });
  });

  it('suspends only the account and never adds profile, health, or workout data', () => {
    usePlatformApprovalStore.getState().suspend('account-003');

    expect(
      usePlatformApprovalStore.getState().accounts.find((item) => item.id === 'account-003'),
    ).toMatchObject({ status: 'suspended', role: 'member' });
    expect(usePlatformApprovalStore.getState().audit[0]).toMatchObject({
      action: 'account_suspended',
      subjectType: 'account',
      subjectId: 'account-003',
    });
  });
});
