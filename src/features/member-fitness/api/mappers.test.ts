import { describe, expect, it } from 'vitest';

import { EMPTY_PROFILE, type MemberFitnessProfile } from '../model/profileSetupModel';

import { toBodyInput, toGoalInput, toNutritionInput, toTrainingInput } from './mappers';

const profile = (patch: Partial<MemberFitnessProfile>): MemberFitnessProfile => ({
  ...EMPTY_PROFILE,
  ...patch,
});

describe('toGoalInput', () => {
  it('returns null until a primary goal is chosen', () => {
    expect(toGoalInput(EMPTY_PROFILE)).toBeNull();
  });

  it('maps FE goals to backend enum names and drops invalid values', () => {
    const goal = toGoalInput(
      profile({
        goals: {
          primary: 'fat_loss',
          secondary: ['mobility'],
          targetWeightKg: 0,
          targetDate: '2026-12-31',
          focusAreas: ['core'],
        },
      }),
    );
    expect(goal).toEqual({
      goalType: 'WeightLoss',
      description: 'mobility, core',
      targetWeightKg: null,
      targetDate: '2026-12-31',
    });
  });
});

describe('toTrainingInput', () => {
  const training = {
    ...EMPTY_PROFILE.training,
    experience: 'beginner' as const,
    sessionMinutes: 45 as const,
    availableDays: ['mon', 'wed', 'fri'],
    equipment: ['dumbbell'],
    environments: ['home'],
  };

  it('returns null when required answers are missing', () => {
    expect(toTrainingInput(EMPTY_PROFILE)).toBeNull();
    expect(toTrainingInput(profile({ training: { ...training, availableDays: [] } }))).toBeNull();
  });

  it('maps schedule and flags limitations from pain', () => {
    const input = toTrainingInput(
      profile({
        training,
        movement: { ...EMPTY_PROFILE.movement, currentPain: 'yes', painAreas: ['knee'] },
      }),
    );
    expect(input).toEqual({
      experienceLevel: 'beginner',
      weeklyWorkoutDays: 3,
      sessionDurationMinutes: 45,
      equipmentAccess: 'dumbbell, home',
      hasLimitations: true,
      limitationNotes: 'knee',
    });
  });

  it('does not flag limitations when there is no pain or condition', () => {
    const input = toTrainingInput(
      profile({
        training,
        movement: { ...EMPTY_PROFILE.movement, currentPain: 'no' },
        health: { ...EMPTY_PROFILE.health, conditions: ['none'] },
      }),
    );
    expect(input?.hasLimitations).toBe(false);
    expect(input?.limitationNotes).toBeNull();
  });
});

describe('toNutritionInput', () => {
  it('returns null without date of birth and sex', () => {
    expect(toNutritionInput(EMPTY_PROFILE)).toBeNull();
  });

  it('maps sex for the equation and ignores values the backend cannot use', () => {
    const base = EMPTY_PROFILE.identity;
    expect(
      toNutritionInput(
        profile({ identity: { ...base, sexAtBirth: 'female', dateOfBirth: '1995-05-01' } }),
      ),
    ).toEqual({ dateOfBirth: '1995-05-01', sexForEquation: 'Female', activityBaseline: null });
    expect(toNutritionInput(profile({ identity: { ...base, sexAtBirth: 'intersex' } }))).toBeNull();
  });
});

describe('toBodyInput', () => {
  const now = new Date('2026-10-09T10:00:00.000Z');

  it('returns null without weight or height', () => {
    expect(toBodyInput(EMPTY_PROFILE, now)).toBeNull();
  });

  it('keeps only values inside the backend ranges', () => {
    const body = toBodyInput(
      profile({
        identity: {
          ...EMPTY_PROFILE.identity,
          weightKg: 70,
          heightCm: 10,
          bodyFatPercent: 18,
          measurementSource: 'smart_scale',
        },
      }),
      now,
    );
    expect(body).toEqual({
      checkedInAtUtc: '2026-10-09T10:00:00.000Z',
      weightKg: 70,
      heightCm: null,
      bodyFatPercentage: 18,
      bodyFatMethod: 'smart_scale',
      notes: null,
    });
  });
});
