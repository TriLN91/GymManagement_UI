import type { MemberFitnessProfile } from './profileSetupModel';

// Maintenance-calorie estimate, following doc/backend_calories.md (model 1, PAL_TOTAL):
//   REE  = Mifflin-St Jeor (1990)
//   TDEE = REE x PAL_total (workout calories are NOT added, PAL already covers the whole lifestyle)
// The backend (EnergyCalculator) uses the same REE equation, so both sides agree.

export const ENERGY_FORMULA_VERSION = 'mifflin_1990';
export const MIN_ENERGY_AGE_YEARS = 18;

/**
 * Total PAL per self-reported daily activity level. Values sit inside the FAO/WHO/UNU 2004 ranges:
 * sedentary/light 1.40-1.69, moderately active 1.70-1.99, vigorous 2.00-2.40.
 */
export const PAL_BY_ACTIVITY = Object.freeze({
  sedentary: 1.4,
  light: 1.55,
  moderate: 1.85,
  high: 2.2,
} as const);

export const PAL_SOURCE = 'FAO/WHO/UNU 2004, self-reported activity level';

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
  const tdee = ree * pal;
  return {
    status: 'ok',
    reeKcal: Math.round(ree),
    pal,
    tdeeKcal: Math.round(tdee),
    tdeeLowKcal: Math.round(tdee * (1 - ESTIMATE_UNCERTAINTY)),
    tdeeHighKcal: Math.round(tdee * (1 + ESTIMATE_UNCERTAINTY)),
    formulaVersion: ENERGY_FORMULA_VERSION,
  };
}
