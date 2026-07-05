// CoachingPlan and its parts — domain entity.
export type GoalType =
  'weight_loss' | 'muscle_gain' | 'endurance' | 'recomposition' | 'maintenance';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
}

export interface WorkoutDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  exercises: ReadonlyArray<Exercise>;
  estimatedMinutes: number;
}

export interface WorkoutPlan {
  weeklySchedule: ReadonlyArray<WorkoutDay>;
  weeklyMinutes: number;
}

export interface NutritionPlan {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  notes?: string;
}

export interface CoachingPlan {
  id: string;
  memberId: string;
  goal: GoalType;
  experienceLevel: ExperienceLevel;
  workoutPlan: WorkoutPlan;
  nutritionPlan: NutritionPlan;
  version: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface BodyMeasurements {
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  thighCm?: number;
  armCm?: number;
}

export interface CheckIn {
  id: string;
  memberId: string;
  weightKg: number;
  bodyMeasurements?: BodyMeasurements;
  workoutCompletionRate: number;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  fatigueLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  createdAt: string;
}

export interface CheckInPayload {
  weightKg: number;
  bodyMeasurements?: BodyMeasurements;
  workoutCompletionRate: number;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  fatigueLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}
