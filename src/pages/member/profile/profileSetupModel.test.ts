import { describe, expect, it } from 'vitest';

import {
  calculateProfileReadiness,
  EMPTY_PROFILE,
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
    },
    goals: { ...EMPTY_PROFILE.goals, primary: 'strength' },
    health: {
      ...EMPTY_PROFILE.health,
      conditions: ['none'],
      screening: {
        heartOrChestSymptoms: 'no',
        highBloodPressure: 'no',
        dizzinessOrFainting: 'no',
        breathlessAtRest: 'no',
        recentConcussion: 'no',
        providerRestriction: 'no',
      },
    },
    movement: { ...EMPTY_PROFILE.movement, currentPain: 'no' },
    training: {
      ...EMPTY_PROFILE.training,
      experience: 'intermediate',
      activityLevel: 'moderate',
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

  it('requires medical review for chest symptoms or measured high blood pressure', () => {
    const profile = completeProfile();
    profile.health.screening.heartOrChestSymptoms = 'yes';
    profile.identity.systolicBp = 165;

    expect(calculateProfileReadiness(profile)).toMatchObject({
      level: 'medical_review',
      reasons: ['screening_flag', 'blood_pressure'],
    });
  });

  it('routes current pain and chronic conditions to PT review', () => {
    const profile = completeProfile();
    profile.health.conditions = ['diabetes'];
    profile.movement.currentPain = 'yes';

    expect(calculateProfileReadiness(profile)).toMatchObject({
      level: 'pt_review',
      reasons: ['condition', 'pain_or_injury'],
    });
  });

  it('treats uncertainty about movement-limiting pain as needing PT review', () => {
    const profile = completeProfile();
    profile.movement.currentPain = 'unsure';

    expect(calculateProfileReadiness(profile)).toMatchObject({
      level: 'pt_review',
      reasons: ['pain_or_injury'],
    });
  });

  it('keeps the none option exclusive in multi-select fields', () => {
    expect(toggleExclusiveValue(['asthma'], 'none')).toEqual(['none']);
    expect(toggleExclusiveValue(['none'], 'diabetes')).toEqual(['diabetes']);
  });
});
