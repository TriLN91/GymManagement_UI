import { beforeEach, describe, expect, it } from 'vitest';

import {
  createEmptyBranch,
  EMPTY_BRAND,
  isBrandAndBranchesComplete,
  useGymOwnerOnboardingStore,
} from './useGymOwnerOnboardingStore';

const completeBrand = {
  name: 'Fit District',
  description: 'Strength and mobility training.',
  contactPhone: '+84 908 000 000',
};

const completeBranch = {
  ...createEmptyBranch('branch-one'),
  name: 'Thao Dien',
  city: 'Ho Chi Minh City',
  address: '18 Nguyen Van Huong',
  contactPhone: '+84 908 000 001',
  operatingHours: '06:00–22:00',
};

describe('Gym Owner onboarding store', () => {
  beforeEach(() => {
    localStorage.clear();
    useGymOwnerOnboardingStore.setState({
      brand: EMPTY_BRAND,
      branches: [createEmptyBranch()],
      license: null,
      status: 'draft',
      rejectionReason: null,
      submissionCount: 0,
      submittedAt: null,
    });
  });

  it('requires a complete brand and every branch', () => {
    expect(isBrandAndBranchesComplete(useGymOwnerOnboardingStore.getState())).toBe(false);
    useGymOwnerOnboardingStore.getState().saveBrandAndBranches(completeBrand, [completeBranch]);
    expect(isBrandAndBranchesComplete(useGymOwnerOnboardingStore.getState())).toBe(true);
  });

  it('stores license metadata without persisting file contents', () => {
    useGymOwnerOnboardingStore.getState().saveLicense({
      name: 'license.pdf',
      size: 245_000,
      type: 'application/pdf',
      uploadedAt: '2026-09-30T10:00:00.000Z',
    });
    expect(useGymOwnerOnboardingStore.getState().license?.name).toBe('license.pdf');
  });

  it('moves rejected applications back to review after resubmission', () => {
    const store = useGymOwnerOnboardingStore.getState();
    store.submitApplication();
    useGymOwnerOnboardingStore
      .getState()
      .applyReviewState('rejected', 'The uploaded document is unreadable.');
    expect(useGymOwnerOnboardingStore.getState().rejectionReason).toContain('unreadable');

    useGymOwnerOnboardingStore.getState().resubmitApplication();
    expect(useGymOwnerOnboardingStore.getState()).toMatchObject({
      status: 'under_review',
      rejectionReason: null,
      submissionCount: 2,
    });
  });
});
