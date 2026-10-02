export type TrackingType = 'strength' | 'duration' | 'distance' | 'interval';

interface ExerciseBase {
  id: string;
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

export type WorkoutDayStatus = 'completed' | 'ready' | 'upcoming' | 'rest';

export interface WorkoutDayPlan {
  id: string;
  dayNumber: number;
  weekday: string;
  dateLabel: string;
  title: string;
  focus: string;
  durationMinutes: number;
  status: WorkoutDayStatus;
  exercises: ReadonlyArray<WorkoutExercise>;
}

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
  id: string;
  dayId: string;
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

export interface CompletedWorkoutSession extends ActiveWorkoutSession {
  completedAt: string;
  totals: WorkoutTotals;
}
