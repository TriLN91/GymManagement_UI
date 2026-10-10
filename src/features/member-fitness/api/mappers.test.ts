import { describe, expect, it } from 'vitest';

import { EMPTY_PROFILE, type MemberFitnessProfile } from '../model/profileSetupModel';

import { toBodyInput, toGoalInput, toNutritionInput, toTrainingInput } from './mappers';

const profile = (patch: Partial<MemberFitnessProfile>): MemberFitnessProfile => ({
  ...EMPTY_PROFILE,
  ...patch,
});

describe('toGoalInput', () => {
  it('returns null until a goal is chosen', () => {
    expect(toGoalInput(EMPTY_PROFILE)).toBeNull();
  });

  it('maps FE goals to backend enum names and drops invalid values', () => {
    const goal = toGoalInput(
      profile({
        goals: {
          selected: ['fat_loss', 'mobility'],
          targetWeightKg: 0,
          targetDate: '2026-12-31',
        },
      }),
    );
    expect(goal).toEqual({
      goalType: 'WeightLoss',
      description: 'fat_loss, mobility',
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

  it('maps schedule and flags limitations from an injury', () => {
    const input = toTrainingInput(
      profile({
        training,
        movement: { upperBodyInjury: 'no', lowerBodyInjury: 'yes' },
      }),
    );
    expect(input).toEqual({
      experienceLevel: 'beginner',
      weeklyWorkoutDays: 3,
      sessionDurationMinutes: 45,
      equipmentAccess: 'dumbbell, home',
      hasLimitations: true,
      limitationNotes: 'Lower body injury; Prefer upper body training while lower body recovers',
    });
  });

  it('does not flag limitations when there is no pain', () => {
    const input = toTrainingInput(
      profile({
        training,
        movement: { upperBodyInjury: 'no', lowerBodyInjury: 'no' },
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
    ).toEqual({
      dateOfBirth: '1995-05-01',
      sexForEquation: 'Female',
      activityBaseline: null,
      palTotal: null,
      palSource: null,
    });
    expect(toNutritionInput(profile({ identity: { ...base, sexAtBirth: 'intersex' } }))).toBeNull();
  });
});

describe('toNutritionInput PAL', () => {
  it('sends the total PAL of the chosen activity level', () => {
    const input = toNutritionInput(
      profile({
        identity: {
          ...EMPTY_PROFILE.identity,
          sexAtBirth: 'male',
          dateOfBirth: '1995-05-01',
          activityLevel: 'light',
        },
      }),
    );
    expect(input).toMatchObject({ activityBaseline: 'light', palTotal: 1.55 });
    expect(input?.palSource).toContain('FAO');
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
