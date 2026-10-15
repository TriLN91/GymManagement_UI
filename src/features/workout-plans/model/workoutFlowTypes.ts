export type TrackingType = 'strength' | 'duration' | 'distance' | 'interval';

interface ExerciseBase {
  /** Unique within a session: `${backendExerciseId}:${sortOrder}`. */
  id: string;
  backendExerciseId: string;
  sortOrder: number;
  name: string;
  muscleGroup: string;
  equipment: string;
  instructions: ReadonlyArray<string>;
}

export interface StrengthExercise extends ExerciseBase {
  trackingType: 'strength';
  target: { sets: number; reps: number; loadKg: number; restSeconds: number };
}

export interface DurationExercise extends ExerciseBase {
  trackingType: 'duration';
  target: { sets: number; durationSeconds: number; restSeconds: number };
}

export interface DistanceExercise extends ExerciseBase {
  trackingType: 'distance';
  target: { distanceKm: number; durationSeconds?: number };
}

export interface IntervalExercise extends ExerciseBase {
  trackingType: 'interval';
  target: { rounds: number; workSeconds: number; restSeconds: number };
}

export type WorkoutExercise =
  StrengthExercise | DurationExercise | DistanceExercise | IntervalExercise;

export type WorkoutDayStatus =
  'completed' | 'ready' | 'upcoming' | 'rest' | 'missed' | 'paused' | 'pending' | 'none';

/** One UTC+7 business day of the Member's schedule (id = yyyy-MM-dd). */
export interface WorkoutDayPlan {
  id: string;
  /** Plan day expected by the CF05 schedule; null for rest/paused/no-plan days. */
  dayNumber: number | null;
  versionId: string | null;
  /** ISO weekday name in lower case: monday … sunday. */
  weekday: string;
  isToday: boolean;
  durationMinutes: number;
  status: WorkoutDayStatus;
  exercises: ReadonlyArray<WorkoutExercise>;
}

export type WorkoutSource =
  | { kind: 'plan'; versionId: string; planDayNumber: number; businessDate: string }
  | { kind: 'free' };

export interface StrengthLog {
  trackingType: 'strength';
  sets: Array<{
    setNumber: number;
    reps: number;
    loadKg: number;
    rpe?: number;
    completed: boolean;
  }>;
}

export interface DurationLog {
  trackingType: 'duration';
  sets: Array<{ setNumber: number; durationSeconds: number; completed: boolean }>;
}

export interface DistanceLog {
  trackingType: 'distance';
  distanceKm: number;
  durationSeconds: number;
}

export interface IntervalLog {
  trackingType: 'interval';
  completedRounds: number;
  workSeconds: number;
  restSeconds: number;
}

export type ExerciseLog = StrengthLog | DurationLog | DistanceLog | IntervalLog;

export interface ActiveWorkoutSession {
  /** Also the backend ClientRequestId, so every retry of this workout is the same request. */
  id: string;
  /** Business date for plan workouts, `free` for self-logged ones. */
  dayId: string;
  source: WorkoutSource;
  title: string;
  /** Snapshot taken at start: the plan may change while the Member trains. */
  exercises: ReadonlyArray<WorkoutExercise>;
  startedAt: string;
  currentExerciseIndex: number;
  logs: Record<string, ExerciseLog>;
}

export interface WorkoutTotals {
  totalVolumeKg: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  completedRounds: number;
}

export type SyncStatus = 'pending' | 'synced' | 'rejected';

export interface CompletedWorkoutSession extends ActiveWorkoutSession {
  completedAt: string;
  totals: WorkoutTotals;
  sync: {
    status: SyncStatus;
    /** Set after the create call succeeds so a retry only repeats the completion call. */
    backendSessionId: string | null;
    error: string | null;
  };
}
