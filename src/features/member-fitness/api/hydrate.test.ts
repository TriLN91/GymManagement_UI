import { describe, expect, it } from 'vitest';

import { EMPTY_PROFILE, type MemberFitnessProfile } from '../model/profileSetupModel';

import { goalIdsFromBackend, mergeBackendProfile } from './hydrate';
import type { BackendBody, BackendProfile } from './types';

const training = {
  experienceLevel: 'intermediate',
  weeklyWorkoutDays: 4,
  sessionDurationMinutes: 60,
  hasLimitations: true,
  limitationNotes: 'Lower body injury; Prefer upper body training while lower body recovers',
};

const remote: BackendProfile = {
  memberProfileId: 'mp-1',
  revision: 2,
  goal: {
    goalType: 'Strength',
    description: 'strength, fat_loss, unknown_goal',
    targetWeightKg: 68,
    targetDate: '2026-12-31',
  },
  training,
  nutrition: { dateOfBirth: '1995-05-05', sexForEquation: 'Female', activityBaseline: 'light' },
};

const body: BackendBody = {
  checkedInAtUtc: '2026-10-01T00:00:00Z',
  weightKg: 62.5,
  heightCm: 168,
  bodyFatPercentage: 24,
  bodyFatMethod: 'smart_scale',
};

describe('mergeBackendProfile', () => {
  it('restores an empty wizard from the backend', () => {
    const merged = mergeBackendProfile(EMPTY_PROFILE, remote, body);
    expect(merged.goals).toMatchObject({
      selected: ['strength', 'fat_loss'],
      targetWeightKg: 68,
      targetDate: '2026-12-31',
    });
    expect(merged.training).toMatchObject({ experience: 'intermediate', sessionMinutes: 60 });
    // The backend keeps only the number of days, so the chosen weekdays stay empty.
    expect(merged.training.availableDays).toEqual([]);
    expect(merged.movement).toEqual({ upperBodyInjury: '', lowerBodyInjury: 'yes' });
    expect(merged.identity).toMatchObject({
      dateOfBirth: '1995-05-05',
      sexAtBirth: 'female',
      activityLevel: 'light',
      heightCm: 168,
      weightKg: 62.5,
      bodyFatPercent: 24,
      measurementSource: 'smart_scale',
    });
  });

  it('never overwrites what the Member already entered', () => {
    const local: MemberFitnessProfile = {
      ...EMPTY_PROFILE,
      identity: { ...EMPTY_PROFILE.identity, weightKg: 80, activityLevel: 'high' },
      goals: { ...EMPTY_PROFILE.goals, selected: ['mobility'] },
      training: { ...EMPTY_PROFILE.training, experience: 'beginner' },
    };
    const merged = mergeBackendProfile(local, remote, body);
    expect(merged.identity.weightKg).toBe(80);
    expect(merged.identity.activityLevel).toBe('high');
    expect(merged.goals.selected).toEqual(['mobility']);
    expect(merged.training.experience).toBe('beginner');
    // Empty fields are still filled.
    expect(merged.identity.heightCm).toBe(168);
  });

  it('marks both injury questions as "no" when the backend reports no limitations', () => {
    const noLimits: BackendProfile = {
      ...remote,
      training: { ...training, hasLimitations: false, limitationNotes: null },
    };
    const merged = mergeBackendProfile(EMPTY_PROFILE, noLimits, null);
    expect(merged.movement).toEqual({ upperBodyInjury: 'no', lowerBodyInjury: 'no' });
  });

  it('ignores unknown values and an empty backend', () => {
    const merged = mergeBackendProfile(
      EMPTY_PROFILE,
      {
        memberProfileId: 'mp-2',
        revision: 0,
        goal: null,
        training: { ...training, experienceLevel: 'expert', sessionDurationMinutes: 50 },
        nutrition: { dateOfBirth: null, sexForEquation: null, activityBaseline: 'extreme' },
      },
      null,
    );
    expect(merged.training.experience).toBe('');
    expect(merged.training.sessionMinutes).toBeNull();
    expect(merged.identity.activityLevel).toBe('');
    expect(merged.identity.sexAtBirth).toBe('');
  });
});

describe('goalIdsFromBackend', () => {
  it('falls back to the stored goal type when the description has no known goal', () => {
    const base = { description: null, targetWeightKg: null, targetDate: null };
    expect(goalIdsFromBackend({ ...base, goalType: 'WeightLoss' })).toEqual(['fat_loss']);
    expect(goalIdsFromBackend({ ...base, goalType: 'Other', description: 'x' })).toEqual([]);
  });
});
