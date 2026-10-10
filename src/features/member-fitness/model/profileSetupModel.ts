export type YesNoAnswer = 'yes' | 'no' | '';
export type TernaryAnswer = 'yes' | 'no' | 'unsure' | '';
export type ProfileRiskLevel = 'ready' | 'pt_review';

export const FITNESS_GOAL_IDS = [
  'muscle_gain',
  'fat_loss',
  'strength',
  'cardio_endurance',
  'muscular_endurance',
  'mobility',
] as const;
export type FitnessGoalId = (typeof FITNESS_GOAL_IDS)[number];

export interface MemberFitnessProfile {
  identity: {
    dateOfBirth: string;
    sexAtBirth: 'female' | 'male' | 'intersex' | 'prefer_not' | '';
    heightCm: number | null;
    weightKg: number | null;
    waistCm: number | null;
    bodyFatPercent: number | null;
    restingHeartRate: number | null;
    systolicBp: number | null;
    diastolicBp: number | null;
    measurementSource: 'self_reported' | 'smart_scale' | 'gym_scan' | '';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'high' | '';
  };
  goals: {
    selected: FitnessGoalId[];
    targetWeightKg: number | null;
    targetDate: string;
  };
  movement: {
    upperBodyInjury: YesNoAnswer;
    lowerBodyInjury: YesNoAnswer;
  };
  training: {
    experience: 'beginner' | 'intermediate' | 'advanced' | '';
    cardioDays: number | null;
    cardioMinutes: number | null;
    strengthDays: number | null;
    availableDays: string[];
    sessionMinutes: 30 | 45 | 60 | 75 | 90 | null;
    environments: string[];
    equipment: string[];
    preferredExercises: string;
    avoidedExercises: string;
  };
  recovery: {
    sleepHours: number | null;
    stressLevel: 1 | 2 | 3 | 4 | 5 | null;
    workPattern: 'mostly_sitting' | 'mixed' | 'mostly_active' | 'shift_work' | '';
    smoking: TernaryAnswer;
    alcoholPerWeek: number | null;
  };
  consent: {
    shareWithAssignedTrainer: boolean;
    dataAccuracy: boolean;
    screeningAcknowledged: boolean;
  };
  updatedAt: string | null;
}

export interface ProfileReadiness {
  level: ProfileRiskLevel;
  reasons: string[];
  bmi: number | null;
  completeness: number;
}

export const EMPTY_PROFILE: MemberFitnessProfile = {
  identity: {
    dateOfBirth: '',
    sexAtBirth: '',
    heightCm: null,
    weightKg: null,
    waistCm: null,
    bodyFatPercent: null,
    restingHeartRate: null,
    systolicBp: null,
    diastolicBp: null,
    measurementSource: '',
    activityLevel: '',
  },
  goals: {
    selected: [],
    targetWeightKg: null,
    targetDate: '',
  },
  movement: {
    upperBodyInjury: '',
    lowerBodyInjury: '',
  },
  training: {
    experience: '',
    cardioDays: null,
    cardioMinutes: null,
    strengthDays: null,
    availableDays: [],
    sessionMinutes: null,
    environments: [],
    equipment: [],
    preferredExercises: '',
    avoidedExercises: '',
  },
  recovery: {
    sleepHours: null,
    stressLevel: null,
    workPattern: '',
    smoking: '',
    alcoholPerWeek: null,
  },
  consent: {
    shareWithAssignedTrainer: false,
    dataAccuracy: false,
    screeningAcknowledged: false,
  },
  updatedAt: null,
};

export function calculateProfileReadiness(profile: MemberFitnessProfile): ProfileReadiness {
  const { identity, goals, movement, training, recovery, consent } = profile;
  const reasons: string[] = [];
  let level: ProfileRiskLevel = 'ready';
  if (movement.upperBodyInjury === 'yes' || movement.lowerBodyInjury === 'yes') {
    level = 'pt_review';
    reasons.push('injury');
  }

  const requiredChecks = [
    Boolean(identity.dateOfBirth),
    Boolean(identity.sexAtBirth),
    Boolean(identity.heightCm),
    Boolean(identity.weightKg),
    goals.selected.length > 0,
    Boolean(movement.upperBodyInjury),
    Boolean(movement.lowerBodyInjury),
    Boolean(training.experience),
    Boolean(identity.activityLevel),
    training.availableDays.length > 0,
    Boolean(training.sessionMinutes),
    training.environments.length > 0,
    Boolean(recovery.sleepHours),
    Boolean(recovery.stressLevel),
    Boolean(recovery.workPattern),
    Boolean(recovery.smoking),
    consent.dataAccuracy,
    consent.screeningAcknowledged,
  ];
  const completeness = Math.round(
    (requiredChecks.filter(Boolean).length / requiredChecks.length) * 100,
  );
  const bmi =
    identity.heightCm && identity.weightKg
      ? identity.weightKg / Math.pow(identity.heightCm / 100, 2)
      : null;

  return { level, reasons, bmi, completeness };
}

export function toggleExclusiveValue(values: string[], value: string, exclusive = 'none') {
  if (value === exclusive) return values.includes(exclusive) ? [] : [exclusive];
  const withoutExclusive = values.filter((item) => item !== exclusive);
  return withoutExclusive.includes(value)
    ? withoutExclusive.filter((item) => item !== value)
    : [...withoutExclusive, value];
}

export type InjuryAdvice = 'none' | 'train_lower' | 'train_upper' | 'rest';

/**
 * What to do with the training split given the injuries. Returns null until both questions are
 * answered. One injured half: train the other half while it recovers. Both: rest.
 */
export function getInjuryAdvice(movement: MemberFitnessProfile['movement']): InjuryAdvice | null {
  const { upperBodyInjury: upper, lowerBodyInjury: lower } = movement;
  if (!upper || !lower) return null;
  if (upper === 'yes' && lower === 'yes') return 'rest';
  if (upper === 'yes') return 'train_lower';
  if (lower === 'yes') return 'train_upper';
  return 'none';
}
