// Mirrors AIFitness.Core.DTOs (Cf01Dtos): CoachingController GET /coaching/me/plans,
// WorkoutController /workouts/exercises and /workouts/me/sessions.

export interface ExerciseView {
  id: string;
  code: string | null;
  name: string;
  equipment: string | null;
  muscleGroup: string | null;
  instructions: string | null;
}

export interface WorkoutExerciseDraft {
  exerciseId: string;
  dayNumber: number;
  sortOrder: number;
  sets: number | null;
  reps: number | null;
  durationSeconds: number | null;
  notes: string | null;
}

export type PlanStatus = 'Draft' | 'Active' | 'Superseded' | 'Archived';

export interface WorkoutVersionView {
  id: string;
  versionNumber: number;
  status: PlanStatus;
  effectiveFromUtc: string;
  effectiveToUtc: string | null;
  exercises: WorkoutExerciseDraft[];
  dayDurations: Array<{ dayNumber: number; estimatedMinutes: number }>;
  name: string;
}

export interface WorkoutPlanView {
  id: string;
  name: string;
  status: PlanStatus;
  managedByTrainerProfileId: string | null;
  versions: WorkoutVersionView[];
}

export interface PlansView {
  workout: WorkoutPlanView[];
}

export interface LogInput {
  setNumber: number;
  repsCompleted: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  perceivedExertion: number | null;
  notes: string | null;
}

export interface SessionInput {
  clientRequestId: string;
  workoutPlanVersionId: string | null;
  scheduledAtUtc: string;
  notes: string | null;
  exercises: Array<{ exerciseId: string; sortOrder: number; logs: LogInput[] }>;
  activitySegments: never[];
  planDayNumber: number | null;
}

/** Body of PUT /workouts/me/sessions/{id}: the backend rejects unknown fields and a stale `expectedRevision` (409). */
export interface SessionCorrectionBody {
  expectedRevision: number;
  notes: string | null;
  exercises: Array<{ exerciseId: string; sortOrder: number; logs: LogInput[] }>;
  activitySegments: never[];
}

export interface SessionView {
  id: string;
  revision: number;
  workoutPlanVersionId: string | null;
  status: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
  scheduledAtUtc: string;
  completedAtUtc: string | null;
  notes: string | null;
  exercises: Array<{
    id: string;
    exerciseId: string;
    sortOrder: number;
    plannedSets: number | null;
    plannedReps: number | null;
    plannedDurationSeconds: number | null;
    logs: LogInput[];
  }>;
}
