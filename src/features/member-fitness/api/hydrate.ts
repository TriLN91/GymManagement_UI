import {
  FITNESS_GOAL_IDS,
  type FitnessGoalId,
  type MemberFitnessProfile,
} from '../model/profileSetupModel';

import type { BackendBody, BackendProfile } from './types';

// Reverse of mappers.ts: rebuilds what the wizard can know from the backend, so a Member on a new
// device (or after clearing the browser) does not start from an empty form. The backend stores less
// than the wizard collects (it keeps only the number of workout days, not which days; consents stay
// local), so only fields it really holds are restored, and only where the local value is empty.

const GOAL_TO_ID: Readonly<Record<string, FitnessGoalId>> = {
  WeightLoss: 'fat_loss',
  MuscleGain: 'muscle_gain',
  Strength: 'strength',
  Endurance: 'cardio_endurance',
  GeneralFitness: 'mobility',
};

const EXPERIENCE = ['beginner', 'intermediate', 'advanced'] as const;
const SESSION_MINUTES = [30, 45, 60, 75, 90] as const;
const ACTIVITY = ['sedentary', 'light', 'moderate', 'high'] as const;
const MEASUREMENT_SOURCES = ['self_reported', 'smart_scale', 'gym_scan'] as const;

const isOneOf = <T extends string | number>(list: ReadonlyArray<T>, value: unknown): value is T =>
  list.includes(value as T);

export function goalIdsFromBackend(goal: NonNullable<BackendProfile['goal']>): FitnessGoalId[] {
  const described = (goal.description ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter((part): part is FitnessGoalId => isOneOf(FITNESS_GOAL_IDS, part));
  if (described.length > 0) return [...new Set(described)];
  const fallback = GOAL_TO_ID[goal.goalType];
  return fallback ? [fallback] : [];
}

export function mergeBackendProfile(
  local: MemberFitnessProfile,
  remote: BackendProfile,
  latestBody: BackendBody | null,
): MemberFitnessProfile {
  const next: MemberFitnessProfile = {
    ...local,
    identity: { ...local.identity },
    goals: { ...local.goals },
    movement: { ...local.movement },
    training: { ...local.training },
  };

  const { goal, training, nutrition } = remote;
  if (goal) {
    if (next.goals.selected.length === 0) next.goals.selected = goalIdsFromBackend(goal);
    if (next.goals.targetWeightKg === null && goal.targetWeightKg !== null) {
      next.goals.targetWeightKg = goal.targetWeightKg;
    }
    if (!next.goals.targetDate && goal.targetDate) next.goals.targetDate = goal.targetDate;
  }

  if (training) {
    if (!next.training.experience && isOneOf(EXPERIENCE, training.experienceLevel)) {
      next.training.experience = training.experienceLevel;
    }
    if (
      next.training.sessionMinutes === null &&
      isOneOf(SESSION_MINUTES, training.sessionDurationMinutes)
    ) {
      next.training.sessionMinutes = training.sessionDurationMinutes;
    }
    // The FE writes "Upper body injury" / "Lower body injury" into the notes (see toTrainingInput).
    const notes = training.limitationNotes ?? '';
    if (!training.hasLimitations) {
      if (!next.movement.upperBodyInjury) next.movement.upperBodyInjury = 'no';
      if (!next.movement.lowerBodyInjury) next.movement.lowerBodyInjury = 'no';
    } else {
      if (!next.movement.upperBodyInjury && notes.includes('Upper body injury')) {
        next.movement.upperBodyInjury = 'yes';
      }
      if (!next.movement.lowerBodyInjury && notes.includes('Lower body injury')) {
        next.movement.lowerBodyInjury = 'yes';
      }
    }
  }

  if (nutrition) {
    if (!next.identity.dateOfBirth && nutrition.dateOfBirth) {
      next.identity.dateOfBirth = nutrition.dateOfBirth;
    }
    if (!next.identity.sexAtBirth) {
      if (nutrition.sexForEquation === 'Male') next.identity.sexAtBirth = 'male';
      if (nutrition.sexForEquation === 'Female') next.identity.sexAtBirth = 'female';
    }
    if (!next.identity.activityLevel && isOneOf(ACTIVITY, nutrition.activityBaseline)) {
      next.identity.activityLevel = nutrition.activityBaseline;
    }
  }

  if (latestBody) {
    if (next.identity.heightCm === null && latestBody.heightCm !== null) {
      next.identity.heightCm = latestBody.heightCm;
    }
    if (next.identity.weightKg === null && latestBody.weightKg !== null) {
      next.identity.weightKg = latestBody.weightKg;
    }
    if (next.identity.bodyFatPercent === null && latestBody.bodyFatPercentage !== null) {
      next.identity.bodyFatPercent = latestBody.bodyFatPercentage;
    }
    if (
      !next.identity.measurementSource &&
      isOneOf(MEASUREMENT_SOURCES, latestBody.bodyFatMethod)
    ) {
      next.identity.measurementSource = latestBody.bodyFatMethod;
    }
  }

  return next;
}
