import type { MemberFitnessProfile } from '../model/profileSetupModel';

import type { BodyInput, GoalInput, NutritionInput, TrainingInput } from './types';

// The FE wizard collects far more than the backend stores (screening, recovery, consent...).
// Only the fields the backend understands are mapped; the rest stays local until the BE adds them.

const GOAL_TYPES: Readonly<Record<string, GoalInput['goalType']>> = {
  fat_loss: 'WeightLoss',
  muscle_gain: 'MuscleGain',
  strength: 'Strength',
  endurance: 'Endurance',
  mobility: 'GeneralFitness',
  general: 'GeneralFitness',
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const trimmed = (value: string, max: number): string | null => {
  const text = value.trim();
  return text ? text.slice(0, max) : null;
};

const inRange = (value: number | null, min: number, max: number): number | null =>
  value !== null && value >= min && value <= max ? value : null;

export function toGoalInput(profile: MemberFitnessProfile): GoalInput | null {
  const goalType = GOAL_TYPES[profile.goals.primary];
  if (!goalType) return null;
  return {
    goalType,
    description: trimmed(
      [...profile.goals.secondary, ...profile.goals.focusAreas].join(', '),
      1000,
    ),
    targetWeightKg: inRange(profile.goals.targetWeightKg, 1, 500),
    targetDate: DATE_ONLY.test(profile.goals.targetDate) ? profile.goals.targetDate : null,
  };
}

export function toTrainingInput(profile: MemberFitnessProfile): TrainingInput | null {
  const { training, movement, health } = profile;
  const equipment = [...training.equipment, ...training.environments].join(', ');
  if (
    !training.experience ||
    !training.sessionMinutes ||
    training.availableDays.length === 0 ||
    !equipment
  ) {
    return null;
  }
  const hasPain = movement.currentPain === 'yes' || movement.currentPain === 'unsure';
  const hasCondition = health.conditions.some((condition) => condition !== 'none');
  const notes = [
    movement.painAreas.join(', '),
    movement.injuryDetails,
    movement.movementRestrictions,
    health.conditionDetails,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join('; ');
  return {
    experienceLevel: training.experience,
    weeklyWorkoutDays: Math.min(7, training.availableDays.length),
    sessionDurationMinutes: training.sessionMinutes,
    equipmentAccess: equipment.slice(0, 500),
    hasLimitations: hasPain || hasCondition,
    limitationNotes: trimmed(notes, 1000),
  };
}

export function toNutritionInput(profile: MemberFitnessProfile): NutritionInput | null {
  const { identity, training } = profile;
  const sexForEquation =
    identity.sexAtBirth === 'male' ? 'Male' : identity.sexAtBirth === 'female' ? 'Female' : null;
  const dateOfBirth = DATE_ONLY.test(identity.dateOfBirth) ? identity.dateOfBirth : null;
  if (!dateOfBirth && !sexForEquation) return null;
  return { dateOfBirth, sexForEquation, activityBaseline: training.activityLevel || null };
}

export function toBodyInput(profile: MemberFitnessProfile, now: Date): BodyInput | null {
  const { identity } = profile;
  const weightKg = inRange(identity.weightKg, 1, 500);
  const heightCm = inRange(identity.heightCm, 30, 300);
  if (weightKg === null && heightCm === null) return null;
  return {
    checkedInAtUtc: now.toISOString(),
    weightKg,
    heightCm,
    bodyFatPercentage: inRange(identity.bodyFatPercent, 0.1, 75),
    bodyFatMethod: identity.measurementSource || null,
    notes: null,
  };
}
