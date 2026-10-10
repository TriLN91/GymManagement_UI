import { describe, expect, it } from 'vitest';

import { ageInYears, estimateEnergy, mifflinRee, PAL_BY_ACTIVITY } from './energyEstimate';
import { EMPTY_PROFILE } from './profileSetupModel';

const now = new Date('2026-10-09T10:00:00');
const identity = (patch: Partial<typeof EMPTY_PROFILE.identity>) => ({
  ...EMPTY_PROFILE.identity,
  dateOfBirth: '1996-10-09',
  sexAtBirth: 'male' as const,
  heightCm: 178,
  weightKg: 78,
  activityLevel: 'moderate' as const,
  ...patch,
});

describe('mifflinRee', () => {
  it('matches the cheat sheet in doc/backend_calories.md', () => {
    // man: 10W + 6.25H - 5A + 5 ; woman: ... - 161
    expect(mifflinRee(78, 178, 30, 'male')).toBeCloseTo(1747.5, 5);
    expect(mifflinRee(60, 165, 30, 'female')).toBeCloseTo(1320.25, 5);
  });
});

describe('ageInYears', () => {
  it('counts a birthday only once it has passed', () => {
    expect(ageInYears('1996-10-09', now)).toBe(30);
    expect(ageInYears('1996-10-10', now)).toBe(29);
    expect(ageInYears('not-a-date', now)).toBeNull();
    expect(ageInYears('2030-01-01', now)).toBeNull();
  });
});

describe('estimateEnergy', () => {
  it('multiplies REE by the PAL of the activity level (PAL_TOTAL mode, no workout added)', () => {
    const result = estimateEnergy(identity({}), now);
    expect(result).toMatchObject({
      status: 'ok',
      reeKcal: 1748,
      pal: PAL_BY_ACTIVITY.moderate,
      tdeeKcal: Math.round(1747.5 * PAL_BY_ACTIVITY.moderate),
      formulaVersion: 'mifflin_1990',
    });
    if (result.status === 'ok') {
      expect(result.tdeeLowKcal).toBeLessThan(result.tdeeKcal);
      expect(result.tdeeHighKcal).toBeGreaterThan(result.tdeeKcal);
    }
  });

  it('keeps PAL values inside the FAO ranges and increasing', () => {
    const values = Object.values(PAL_BY_ACTIVITY);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(PAL_BY_ACTIVITY.sedentary).toBeGreaterThanOrEqual(1.4);
    expect(PAL_BY_ACTIVITY.high).toBeLessThanOrEqual(2.4);
  });

  it('reports why it cannot estimate', () => {
    expect(estimateEnergy(EMPTY_PROFILE.identity, now).status).toBe('missing_input');
    expect(estimateEnergy(identity({ activityLevel: '' }), now).status).toBe('missing_input');
    expect(estimateEnergy(identity({ dateOfBirth: '2012-01-01' }), now).status).toBe('under_age');
    expect(estimateEnergy(identity({ sexAtBirth: 'intersex' }), now).status).toBe(
      'sex_unsupported',
    );
  });
});
