export type TernaryAnswer = 'yes' | 'no' | 'unsure' | '';
export type ProfileRiskLevel = 'ready' | 'pt_review' | 'medical_review';

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
  };
  goals: {
    primary: 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'mobility' | 'general' | '';
    secondary: string[];
    targetWeightKg: number | null;
    targetDate: string;
    focusAreas: string[];
  };
  health: {
    screening: {
      heartOrChestSymptoms: TernaryAnswer;
      highBloodPressure: TernaryAnswer;
      dizzinessOrFainting: TernaryAnswer;
      breathlessAtRest: TernaryAnswer;
      recentConcussion: TernaryAnswer;
      providerRestriction: TernaryAnswer;
    };
    conditions: string[];
    conditionDetails: string;
    medications: string;
    allergies: string;
    surgeries: string;
  };
  movement: {
    currentPain: TernaryAnswer;
    painAreas: string[];
    painLevel: number;
    injuryDetails: string;
    movementRestrictions: string;
  };
  training: {
    experience: 'beginner' | 'intermediate' | 'advanced' | '';
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'high' | '';
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
  },
  goals: {
    primary: '',
    secondary: [],
    targetWeightKg: null,
    targetDate: '',
    focusAreas: [],
  },
  health: {
    screening: {
      heartOrChestSymptoms: '',
      highBloodPressure: '',
      dizzinessOrFainting: '',
      breathlessAtRest: '',
      recentConcussion: '',
      providerRestriction: '',
    },
    conditions: [],
    conditionDetails: '',
    medications: '',
    allergies: '',
    surgeries: '',
  },
  movement: {
    currentPain: '',
    painAreas: [],
    painLevel: 0,
    injuryDetails: '',
    movementRestrictions: '',
  },
  training: {
    experience: '',
    activityLevel: '',
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

const criticalScreeningKeys: Array<keyof MemberFitnessProfile['health']['screening']> = [
  'heartOrChestSymptoms',
  'highBloodPressure',
  'dizzinessOrFainting',
  'breathlessAtRest',
  'providerRestriction',
];

export function calculateProfileReadiness(profile: MemberFitnessProfile): ProfileReadiness {
  const { identity, goals, health, movement, training, recovery, consent } = profile;
  const reasons: string[] = [];
  const screeningValues = Object.values(health.screening);
  const hasCriticalAnswer = criticalScreeningKeys.some(
    (key) => health.screening[key] === 'yes' || health.screening[key] === 'unsure',
  );
  const measuredHighBp = (identity.systolicBp ?? 0) >= 160 || (identity.diastolicBp ?? 0) >= 90;

  let level: ProfileRiskLevel = 'ready';
  if (hasCriticalAnswer || measuredHighBp) {
    level = 'medical_review';
    if (hasCriticalAnswer) reasons.push('screening_flag');
    if (measuredHighBp) reasons.push('blood_pressure');
  } else if (
    health.screening.recentConcussion === 'yes' ||
    health.screening.recentConcussion === 'unsure' ||
    health.conditions.some((condition) => condition !== 'none') ||
    movement.currentPain === 'yes' ||
    movement.currentPain === 'unsure'
  ) {
    level = 'pt_review';
    if (health.screening.recentConcussion !== 'no') reasons.push('recent_concussion');
    if (health.conditions.some((condition) => condition !== 'none')) reasons.push('condition');
    if (movement.currentPain === 'yes' || movement.currentPain === 'unsure')
      reasons.push('pain_or_injury');
  }

  const requiredChecks = [
    Boolean(identity.dateOfBirth),
    Boolean(identity.sexAtBirth),
    Boolean(identity.heightCm),
    Boolean(identity.weightKg),
    Boolean(identity.measurementSource),
    Boolean(goals.primary),
    health.conditions.length > 0,
    screeningValues.every(Boolean),
    Boolean(movement.currentPain),
    Boolean(training.experience),
    Boolean(training.activityLevel),
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
