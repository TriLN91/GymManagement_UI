import { describe, expect, it } from 'vitest';

import {
  calculateProfileReadiness,
  EMPTY_PROFILE,
  getInjuryAdvice,
  toggleExclusiveValue,
  type MemberFitnessProfile,
} from './profileSetupModel';

function completeProfile(): MemberFitnessProfile {
  return {
    ...EMPTY_PROFILE,
    identity: {
      ...EMPTY_PROFILE.identity,
      dateOfBirth: '1995-01-01',
      sexAtBirth: 'female',
      heightCm: 165,
      weightKg: 60,
      measurementSource: 'self_reported',
      activityLevel: 'moderate',
    },
    goals: { ...EMPTY_PROFILE.goals, selected: ['strength'] },
    movement: { upperBodyInjury: 'no', lowerBodyInjury: 'no' },
    training: {
      ...EMPTY_PROFILE.training,
      experience: 'intermediate',
      availableDays: ['monday', 'thursday'],
      sessionMinutes: 60,
      environments: ['gym'],
    },
    recovery: {
      ...EMPTY_PROFILE.recovery,
      sleepHours: 7,
      stressLevel: 2,
      workPattern: 'mostly_sitting',
      smoking: 'no',
    },
    consent: {
      ...EMPTY_PROFILE.consent,
      dataAccuracy: true,
      screeningAcknowledged: true,
    },
  };
}

describe('member fitness profile readiness', () => {
  it('allows plan generation for a complete profile without risk flags', () => {
    const result = calculateProfileReadiness(completeProfile());

    expect(result.level).toBe('ready');
    expect(result.completeness).toBe(100);
    expect(result.bmi).toBeCloseTo(22.04, 1);
  });

  it('routes an injury in either half of the body to PT review', () => {
    for (const patch of [
      { upperBodyInjury: 'yes' as const },
      { lowerBodyInjury: 'yes' as const },
    ]) {
      const profile = completeProfile();
      profile.movement = { ...profile.movement, ...patch };

      expect(calculateProfileReadiness(profile)).toMatchObject({
        level: 'pt_review',
        reasons: ['injury'],
      });
    }
  });

  it('keeps the none option exclusive in multi-select fields', () => {
    expect(toggleExclusiveValue(['asthma'], 'none')).toEqual(['none']);
    expect(toggleExclusiveValue(['none'], 'diabetes')).toEqual(['diabetes']);
  });
});

describe('getInjuryAdvice', () => {
  const advice = (upperBodyInjury: 'yes' | 'no' | '', lowerBodyInjury: 'yes' | 'no' | '') =>
    getInjuryAdvice({ upperBodyInjury, lowerBodyInjury });

  it('waits until both questions are answered', () => {
    expect(advice('', '')).toBeNull();
    expect(advice('yes', '')).toBeNull();
  });

  it('trains the healthy half while the injured half rests', () => {
    expect(advice('yes', 'no')).toBe('train_lower');
    expect(advice('no', 'yes')).toBe('train_upper');
  });

  it('asks for rest when both halves are injured and has no advice when neither is', () => {
    expect(advice('yes', 'yes')).toBe('rest');
    expect(advice('no', 'no')).toBe('none');
  });
});
