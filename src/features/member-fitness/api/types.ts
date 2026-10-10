// Request bodies of the backend CF01 profile endpoints (Cf01Dtos.cs). Enums are PascalCase strings;
// the backend rejects unknown fields, so send exactly these keys.
export type BackendGoalType =
  'WeightLoss' | 'MuscleGain' | 'Strength' | 'Endurance' | 'GeneralFitness';

export interface GoalInput {
  goalType: BackendGoalType;
  description: string | null;
  targetWeightKg: number | null;
  /** yyyy-MM-dd */
  targetDate: string | null;
}

export interface TrainingInput {
  experienceLevel: string;
  weeklyWorkoutDays: number;
  sessionDurationMinutes: number;
  equipmentAccess: string;
  hasLimitations: boolean;
  limitationNotes: string | null;
}

export interface NutritionInput {
  /** yyyy-MM-dd */
  dateOfBirth: string | null;
  sexForEquation: 'Male' | 'Female' | null;
  activityBaseline: string | null;
  palTotal: number | null;
  palSource: string | null;
}

export interface BodyInput {
  checkedInAtUtc: string;
  weightKg: number | null;
  heightCm: number | null;
  bodyFatPercentage: number | null;
  bodyFatMethod: string | null;
  notes: string | null;
}
