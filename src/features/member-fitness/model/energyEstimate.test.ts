import { describe, expect, it } from 'vitest';

import {
  ageInYears,
  estimateEnergy,
  mifflinRee,
  nasemTee,
  PAL_BY_ACTIVITY,
} from './energyEstimate';
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
  it('uses the NASEM 2023 TEE equation for adults (PAL_TOTAL mode, no workout added)', () => {
    const result = estimateEnergy(identity({}), now);
    // man 30y, 178 cm, 78 kg, "moderate" (NASEM active): 1004.82 - 10.83*30 + 6.52*178 + 15.91*78
    const expected = 1004.82 - 10.83 * 30 + 6.52 * 178 + 15.91 * 78;
    expect(result).toMatchObject({
      status: 'ok',
      reeKcal: 1748,
      pal: PAL_BY_ACTIVITY.moderate,
      tdeeKcal: Math.round(expected),
      formulaVersion: 'nasem_2023_tee',
    });
    if (result.status === 'ok') {
      expect(result.tdeeLowKcal).toBeLessThan(result.tdeeKcal);
      expect(result.tdeeHighKcal).toBeGreaterThan(result.tdeeKcal);
    }
  });

  it('falls back to Mifflin x PAL for 18-year-olds, who are outside the NASEM adult equations', () => {
    const result = estimateEnergy(identity({ dateOfBirth: '2008-10-09' }), now);
    expect(result).toMatchObject({
      status: 'ok',
      formulaVersion: 'mifflin_1990',
      tdeeKcal: Math.round(mifflinRee(78, 178, 18, 'male') * PAL_BY_ACTIVITY.moderate),
    });
  });

  it('matches hand-worked NASEM values for every level (backend Nasem2023 uses the same table)', () => {
    // 30 years, 175 cm, 70 kg: the same cases as the backend EnergyCalculatorTests.
    expect(nasemTee(70, 175, 30, 'male', 'sedentary')).toBeCloseTo(2552.67, 2);
    expect(nasemTee(70, 175, 30, 'male', 'light')).toBeCloseTo(2754.87, 2);
    expect(nasemTee(70, 175, 30, 'male', 'moderate')).toBeCloseTo(2934.62, 2);
    expect(nasemTee(70, 175, 30, 'male', 'high')).toBeCloseTo(3226.67, 2);
    expect(nasemTee(70, 175, 30, 'female', 'sedentary')).toBeCloseTo(2195.3, 2);
    expect(nasemTee(70, 175, 30, 'female', 'light')).toBeCloseTo(2370.27, 2);
  });

  it('keeps PAL values strictly increasing', () => {
    const values = Object.values(PAL_BY_ACTIVITY);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(new Set(values).size).toBe(values.length);
  });

  // NASEM 2023, Dietary Reference Intakes for Energy, Table 5-5: TEE (kcal/d) for adults 19+.
  // Coefficients: [intercept, age, height cm, weight kg].
  const NASEM_TEE = {
    male: {
      sedentary: [753.07, -10.83, 6.5, 14.1],
      light: [581.47, -10.83, 8.3, 14.94],
      moderate: [1004.82, -10.83, 6.52, 15.91],
      high: [-517.88, -10.83, 15.61, 19.11],
    },
    female: {
      sedentary: [584.9, -7.01, 5.72, 11.71],
      light: [575.77, -7.01, 6.6, 12.14],
      moderate: [710.25, -7.01, 6.54, 12.34],
      high: [511.83, -7.01, 9.07, 12.56],
    },
  } as const;

  // One constant per level cannot match the NASEM equations everywhere (they have different slopes),
  // so check the average error is small and the worst corner (small, older, lean body) stays bounded.
  it.each(['male', 'female'] as const)(
    'matches the NASEM 2023 TEE equations on average for every level (%s)',
    (sex) => {
      const heights = sex === 'male' ? [165, 175, 185] : [150, 160, 170];
      for (const level of Object.keys(PAL_BY_ACTIVITY) as Array<keyof typeof PAL_BY_ACTIVITY>) {
        const [intercept, perYear, perCm, perKg] = NASEM_TEE[sex][level];
        const errors: number[] = [];
        for (const height of heights) {
          for (const bmi of [20, 25, 30]) {
            for (const age of [20, 30, 45, 60]) {
              const weight = bmi * (height / 100) ** 2;
              const reference = intercept + perYear * age + perCm * height + perKg * weight;
              const ours = mifflinRee(weight, height, age, sex) * PAL_BY_ACTIVITY[level];
              errors.push(Math.abs(ours / reference - 1));
            }
          }
        }
        const mean = errors.reduce((sum, error) => sum + error, 0) / errors.length;
        expect(mean).toBeLessThan(0.04);
        expect(Math.max(...errors)).toBeLessThan(0.12);
      }
    },
  );

  it('reports why it cannot estimate', () => {
    expect(estimateEnergy(EMPTY_PROFILE.identity, now).status).toBe('missing_input');
    expect(estimateEnergy(identity({ activityLevel: '' }), now).status).toBe('missing_input');
    expect(estimateEnergy(identity({ dateOfBirth: '2012-01-01' }), now).status).toBe('under_age');
    expect(estimateEnergy(identity({ sexAtBirth: 'intersex' }), now).status).toBe(
      'sex_unsupported',
    );
  });
});
