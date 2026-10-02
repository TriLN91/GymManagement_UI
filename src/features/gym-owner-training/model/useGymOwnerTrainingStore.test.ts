import { beforeEach, describe, expect, it } from 'vitest';

import {
  canTransitionOperationalStatus,
  useGymOwnerTrainingStore,
} from './useGymOwnerTrainingStore';

const trainerInput = {
  fullName: 'Test Trainer',
  email: 'trainer@test.local',
  phone: '0901000000',
  bio: 'A complete Trainer profile for testing.',
  specializations: ['strength'] as const,
  experienceYears: 4,
  selfIntroduction: 'Structured coaching.',
  avatarDataUrl: null,
};

describe('Gym Owner Trainer and PT Package store', () => {
  beforeEach(() => useGymOwnerTrainingStore.getState().reset());

  it('creates a Trainer as draft and submits it for Platform approval', () => {
    const id = useGymOwnerTrainingStore.getState().createTrainer({
      ...trainerInput,
      specializations: [...trainerInput.specializations],
    });
    expect(useGymOwnerTrainingStore.getState().trainers[0]).toMatchObject({
      id,
      approvalStatus: 'draft',
      operationalStatus: null,
    });

    expect(useGymOwnerTrainingStore.getState().submitTrainer(id)).toBe(true);
    expect(
      useGymOwnerTrainingStore.getState().trainers.find((trainer) => trainer.id === id),
    ).toMatchObject({ approvalStatus: 'pending', rejectionReason: null });
  });

  it('allows rejected Trainers to be edited and resubmitted without owner approval', () => {
    const store = useGymOwnerTrainingStore.getState();
    expect(
      store.updateTrainer('trainer-nam', {
        ...trainerInput,
        specializations: [...trainerInput.specializations],
      }),
    ).toBe(true);
    expect(store.submitTrainer('trainer-nam')).toBe(true);
    expect(
      useGymOwnerTrainingStore.getState().trainers.find((trainer) => trainer.id === 'trainer-nam'),
    ).toMatchObject({ approvalStatus: 'pending', rejectionReason: null });
  });

  it('enforces the confirmed operational transitions and terminal Unlinked state', () => {
    expect(canTransitionOperationalStatus('active', 'hidden')).toBe(true);
    expect(canTransitionOperationalStatus('active', 'suspended')).toBe(true);
    expect(canTransitionOperationalStatus('hidden', 'suspended')).toBe(false);
    expect(canTransitionOperationalStatus('suspended', 'active')).toBe(true);
    expect(canTransitionOperationalStatus('unlinked', 'active')).toBe(false);

    const store = useGymOwnerTrainingStore.getState();
    expect(store.setTrainerOperationalStatus('trainer-minh', 'hidden')).toBe(true);
    expect(store.setTrainerOperationalStatus('trainer-minh', 'suspended')).toBe(false);
    expect(store.setTrainerOperationalStatus('trainer-minh', 'unlinked')).toBe(true);
    expect(store.setTrainerOperationalStatus('trainer-minh', 'active')).toBe(false);
  });

  it('resolves only assignment exceptions with an approved active replacement', () => {
    const store = useGymOwnerTrainingStore.getState();
    expect(store.resolveAssignmentException('exception-mai', 'trainer-hana')).toBe(false);
    expect(store.resolveAssignmentException('exception-mai', 'trainer-minh')).toBe(true);
    expect(
      useGymOwnerTrainingStore
        .getState()
        .assignmentExceptions.find((item) => item.id === 'exception-mai'),
    ).toMatchObject({ status: 'resolved', replacementTrainerId: 'trainer-minh' });
    expect(
      useGymOwnerTrainingStore
        .getState()
        .assignments.find((item) => item.memberEmail === 'mai@fit.local'),
    ).toMatchObject({ trainerId: 'trainer-minh' });
  });

  it('creates and edits draft PT Packages, then publishes without an owner unpublish rule', () => {
    const store = useGymOwnerTrainingStore.getState();
    const id = store.createPackage({
      trainerId: 'trainer-minh',
      name: { en: 'Test package', vi: 'Gói thử nghiệm' },
      sessionsIncluded: 8,
      durationDays: 45,
      servicePriceVnd: 3_000_000,
      features: [{ en: 'Assessment', vi: 'Đánh giá' }],
    });
    expect(
      store.updatePackage(id, {
        trainerId: 'trainer-minh',
        name: { en: 'Updated package', vi: 'Gói đã cập nhật' },
        sessionsIncluded: 10,
        durationDays: 60,
        servicePriceVnd: 3_500_000,
        features: [{ en: 'Plan', vi: 'Kế hoạch' }],
      }),
    ).toBe(true);
    expect(store.publishPackage(id)).toBe(true);
    expect(
      useGymOwnerTrainingStore.getState().packages.find((item) => item.id === id),
    ).toMatchObject({ publicationStatus: 'published', sessionsIncluded: 10 });
    expect(
      store.updatePackage(id, {
        trainerId: 'trainer-minh',
        name: { en: 'Blocked', vi: 'Bị chặn' },
        sessionsIncluded: 1,
        durationDays: 1,
        servicePriceVnd: 1,
        features: [],
      }),
    ).toBe(false);
  });
});
