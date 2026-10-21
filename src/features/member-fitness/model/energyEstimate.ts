import type { MemberFitnessProfile } from './profileSetupModel';

// Maintenance-calorie estimate (PAL_TOTAL mode, workout calories are NOT added, the activity level already covers the whole lifestyle).
// Adults 19+: NASEM 2023 "Dietary Reference Intakes for Energy" (Table S-1) predicts total energy expenditure directly from sex, age,
// height, weight and the activity category. 18-year-olds, for whom NASEM's adult equations do not apply, keep Mifflin-St Jeor (1990) x PAL.
// The backend (EnergyCalculator / Nasem2023) uses the same equations and the same category per PAL rung, so both sides agree.

export const ENERGY_FORMULA_VERSION = 'nasem_2023_tee';
export const FALLBACK_FORMULA_VERSION = 'mifflin_1990';
export const NASEM_MIN_AGE_YEARS = 19;
export const MIN_ENERGY_AGE_YEARS = 18;

/**
 * Total PAL per self-reported daily activity level. It is what the app sends to the backend as `palTotal`, and it also drives the
 * Mifflin-St Jeor fallback for 18-year-olds.
 *
 * The four levels are the NASEM 2023 PAL categories (inactive, low active, active, very active). The values are calibrated, not copied:
 * dividing the NASEM TEE equations (adults 19+) by Mifflin REE over ages 20-60 and BMI 20-30 gives a stable ratio for both sexes:
 *   inactive 1.52-1.53, low active 1.65, active 1.76, very active 1.93-1.95.
 * The backend maps a numeric PAL to the nearest rung (cut-offs 1.575 / 1.70 / 1.85).
 */
export const PAL_BY_ACTIVITY = Object.freeze({
  sedentary: 1.5,
  light: 1.65,
  moderate: 1.75,
  high: 1.95,
} as const);

export const PAL_SOURCE =
  'NASEM 2023 Dietary Reference Intakes for Energy (PAL categories); self-reported activity level';

/**
 * Half-width of the displayed range. Placeholder until it is calibrated on real user data
 * (doc section 8.4); predictive equations are only accurate to roughly this order for individuals.
 */
export const ESTIMATE_UNCERTAINTY = 0.1;

export type ActivityLevel = keyof typeof PAL_BY_ACTIVITY;

export type EnergyEstimate =
  | {
      status: 'ok';
      reeKcal: number;
      pal: number;
      tdeeKcal: number;
      tdeeLowKcal: number;
      tdeeHighKcal: number;
      formulaVersion: string;
    }
  | { status: 'missing_input' | 'under_age' | 'sex_unsupported' };

export function ageInYears(dateOfBirth: string, now: Date): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day)) age -= 1;
  return age >= 0 ? age : null;
}

/** Mifflin-St Jeor resting energy expenditure, kcal/day. */
export function mifflinRee(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: 'male' | 'female',
): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + (sex === 'male' ? 5 : -161);
}

/** NASEM 2023 TEE equations, adults 19+: [intercept, age, height cm, weight kg] per activity level. */
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

/** NASEM 2023 total energy expenditure, kcal/day (adults 19+). */
export function nasemTee(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: 'male' | 'female',
  level: ActivityLevel,
): number {
  const [intercept, perYear, perCm, perKg] = NASEM_TEE[sex][level];
  return intercept + perYear * ageYears + perCm * heightCm + perKg * weightKg;
}

export function estimateEnergy(
  identity: MemberFitnessProfile['identity'],
  now: Date = new Date(),
): EnergyEstimate {
  const { dateOfBirth, sexAtBirth, heightCm, weightKg, activityLevel } = identity;
  const age = ageInYears(dateOfBirth, now);
  if (age === null || !sexAtBirth || !heightCm || !weightKg || !activityLevel) {
    return { status: 'missing_input' };
  }
  if (age < MIN_ENERGY_AGE_YEARS) return { status: 'under_age' };
  if (sexAtBirth !== 'male' && sexAtBirth !== 'female') return { status: 'sex_unsupported' };

  const ree = mifflinRee(weightKg, heightCm, age, sexAtBirth);
  if (ree <= 0) return { status: 'missing_input' };
  const pal = PAL_BY_ACTIVITY[activityLevel];
  const useNasem = age >= NASEM_MIN_AGE_YEARS;
  const tdee = useNasem ? nasemTee(weightKg, heightCm, age, sexAtBirth, activityLevel) : ree * pal;
  if (tdee <= 0) return { status: 'missing_input' };
  return {
    status: 'ok',
    reeKcal: Math.round(ree),
    pal,
    tdeeKcal: Math.round(tdee),
    tdeeLowKcal: Math.round(tdee * (1 - ESTIMATE_UNCERTAINTY)),
    tdeeHighKcal: Math.round(tdee * (1 + ESTIMATE_UNCERTAINTY)),
    formulaVersion: useNasem ? ENERGY_FORMULA_VERSION : FALLBACK_FORMULA_VERSION,
  };
}
