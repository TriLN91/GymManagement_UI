// Bodies of the backend CF01 coaching endpoints used by the Trainer workspace (Cf01Dtos.cs).
export type AssignmentStatusDto = string;

export interface AssignmentDto {
  id: string;
  memberProfileId: string;
  memberName: string;
  trainerProfileId: string;
  trainerName: string;
  status: AssignmentStatusDto;
  startsAtUtc: string;
  endsAtUtc: string;
  isCurrent: boolean;
  canReadFitness: boolean;
  canManageWorkout: boolean;
  canManageNutrition: boolean;
}

export interface MemberGoalDto {
  goalType: string;
  description: string | null;
  targetWeightKg: number | null;
  targetDate: string | null;
}

export interface MemberTrainingDto {
  experienceLevel: string;
  weeklyWorkoutDays: number;
  sessionDurationMinutes: number;
  equipmentAccess: string;
  hasLimitations: boolean;
  limitationNotes: string | null;
}

export interface MemberProfileDto {
  memberProfileId: string;
  revision: number;
  goal: MemberGoalDto | null;
  training: MemberTrainingDto | null;
  nutrition: { dateOfBirth: string | null; sexForEquation: string | null } | null;
  missingWorkoutInput: string[];
  missingNutritionInput: string[];
}

/** Workout plans of an assigned Member (Cf01Dtos `PlansView`, workout part only). */
export interface MemberPlansDto {
  workout: Array<{
    id: string;
    name: string;
    status: string;
    managedByTrainerProfileId: string | null;
    versions: Array<{ id: string; versionNumber: number; exercises: unknown[] }>;
  }>;
}
