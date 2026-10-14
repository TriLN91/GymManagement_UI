import { PAL_BY_ACTIVITY, PAL_SOURCE } from '../model/energyEstimate';
import { getInjuryAdvice, type MemberFitnessProfile } from '../model/profileSetupModel';

import type { BodyInput, GoalInput, NutritionInput, TrainingInput } from './types';

// The FE wizard collects far more than the backend stores (screening, recovery, consent...).
// Only the fields the backend understands are mapped; the rest stays local until the BE adds them.

const GOAL_TYPES: Readonly<Record<string, GoalInput['goalType']>> = {
  fat_loss: 'WeightLoss',
  muscle_gain: 'MuscleGain',
  strength: 'Strength',
  cardio_endurance: 'Endurance',
  muscular_endurance: 'Endurance',
  mobility: 'GeneralFitness',
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const trimmed = (value: string, max: number): string | null => {
  const text = value.trim();
  return text ? text.slice(0, max) : null;
};

const inRange = (value: number | null, min: number, max: number): number | null =>
  value !== null && value >= min && value <= max ? value : null;

export function toGoalInput(profile: MemberFitnessProfile): GoalInput | null {
  // The backend stores one goal type: the first selection. All selections go into the description.
  const [first] = profile.goals.selected;
  const goalType = first ? GOAL_TYPES[first] : undefined;
  if (!goalType) return null;
  return {
    goalType,
    description: trimmed(profile.goals.selected.join(', '), 1000),
    targetWeightKg: inRange(profile.goals.targetWeightKg, 1, 500),
    targetDate: DATE_ONLY.test(profile.goals.targetDate) ? profile.goals.targetDate : null,
  };
}

export function toTrainingInput(profile: MemberFitnessProfile): TrainingInput | null {
  const { training, movement } = profile;
  const equipment = [...training.equipment, ...training.environments].join(', ');
  if (
    !training.experience ||
    !training.sessionMinutes ||
    training.availableDays.length === 0 ||
    !equipment
  ) {
    return null;
  }
  const hasPain = movement.upperBodyInjury === 'yes' || movement.lowerBodyInjury === 'yes';
  const advice = getInjuryAdvice(movement);
  const notes = [
    movement.upperBodyInjury === 'yes' ? 'Upper body injury' : '',
    movement.lowerBodyInjury === 'yes' ? 'Lower body injury' : '',
    advice === 'train_lower' ? 'Prefer lower body training while upper body recovers' : '',
    advice === 'train_upper' ? 'Prefer upper body training while lower body recovers' : '',
    advice === 'rest' ? 'Injured upper and lower body: rest until recovered' : '',
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join('; ');
  return {
    experienceLevel: training.experience,
    weeklyWorkoutDays: Math.min(7, training.availableDays.length),
    sessionDurationMinutes: training.sessionMinutes,
    equipmentAccess: equipment.slice(0, 500),
    hasLimitations: hasPain,
    limitationNotes: trimmed(notes, 1000),
  };
}

export function toNutritionInput(profile: MemberFitnessProfile): NutritionInput | null {
  const { identity } = profile;
  const sexForEquation =
    identity.sexAtBirth === 'male' ? 'Male' : identity.sexAtBirth === 'female' ? 'Female' : null;
  const dateOfBirth = DATE_ONLY.test(identity.dateOfBirth) ? identity.dateOfBirth : null;
  if (!dateOfBirth && !sexForEquation) return null;
  const activity = identity.activityLevel;
  return {
    dateOfBirth,
    sexForEquation,
    activityBaseline: activity || null,
    // The backend needs the total PAL to estimate maintenance calories.
    palTotal: activity ? PAL_BY_ACTIVITY[activity] : null,
    palSource: activity ? PAL_SOURCE : null,
  };
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
