import { beforeEach, describe, expect, it } from 'vitest';

import { useGymOwnerProfileStore } from './useGymOwnerProfileStore';

import type { GymOwnerOnboardingData } from '@/features/gym-owner-onboarding';

const onboarding: GymOwnerOnboardingData = {
  brand: { name: 'Fit Central', description: 'Marketplace description', contactPhone: '0901' },
  branches: [
    {
      id: 'branch-main',
      name: 'District 1',
      city: 'Ho Chi Minh City',
      area: 'District 1',
      address: '12 Nguyen Hue',
      contactPhone: '0902',
      operatingHours: '06:00 - 22:00',
      facilities: ['free-weights'],
    },
  ],
  license: null,
  status: 'approved',
  rejectionReason: null,
  submissionCount: 1,
  submittedAt: '2026-10-01T00:00:00.000Z',
};

describe('useGymOwnerProfileStore', () => {
  beforeEach(() => useGymOwnerProfileStore.getState().reset());

  it('initializes once from the approved onboarding profile', () => {
    const store = useGymOwnerProfileStore.getState();
    store.initializeFromOnboarding(onboarding);
    store.initializeFromOnboarding({
      ...onboarding,
      brand: { ...onboarding.brand, name: 'Ignored second seed' },
    });

    expect(useGymOwnerProfileStore.getState().brand.name).toBe('Fit Central');
    expect(useGymOwnerProfileStore.getState().branches).toHaveLength(1);
  });

  it('saves ordinary brand changes immediately', () => {
    useGymOwnerProfileStore.getState().initializeFromOnboarding(onboarding);
    useGymOwnerProfileStore.getState().saveBrand({
      ...onboarding.brand,
      name: 'Fit Central Updated',
    });

    expect(useGymOwnerProfileStore.getState().brand.name).toBe('Fit Central Updated');
  });

  it('adds, updates and removes branches while preserving at least one', () => {
    useGymOwnerProfileStore.getState().initializeFromOnboarding(onboarding);
    const second = { ...onboarding.branches[0]!, id: 'branch-two', name: 'District 7' };
    useGymOwnerProfileStore.getState().addBranch(second);
    useGymOwnerProfileStore.getState().updateBranch({ ...second, name: 'District 7 Updated' });
    expect(useGymOwnerProfileStore.getState().branches[1]?.name).toBe('District 7 Updated');

    useGymOwnerProfileStore.getState().removeBranch('branch-two');
    useGymOwnerProfileStore.getState().removeBranch('branch-main');
    expect(useGymOwnerProfileStore.getState().branches).toHaveLength(1);
  });
});
