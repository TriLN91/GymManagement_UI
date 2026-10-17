import type {
  ExerciseView,
  LogInput,
  PlansView,
  SessionInput,
  SessionView,
  WorkoutExerciseDraft,
  WorkoutVersionView,
} from '../api/types';

import type {
  CompletedWorkoutSession,
  ExerciseLog,
  WorkoutDayPlan,
  WorkoutDayStatus,
  WorkoutExercise,
} from './workoutFlowTypes';

import type { ScheduledDay } from '@/features/gamification/api/types';
import { isoWeekdayOf, parseBusinessDate } from '@/features/gamification/model/presentation';

const WEEKDAY_NAMES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export function addBusinessDays(date: string, days: number): string {
  const { year, month, day } = parseBusinessDate(date);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function findVersion(plans: PlansView | undefined, versionId: string | null) {
  if (!plans || !versionId) return undefined;
  for (const plan of plans.workout) {
    const version = plan.versions.find((item) => item.id === versionId);
    if (version) return version;
  }
  return undefined;
}

export function activeVersion(plans: PlansView | undefined): WorkoutVersionView | undefined {
  return plans?.workout
    .find((plan) => plan.status === 'Active')
    ?.versions.find((version) => version.status === 'Active');
}

function splitInstructions(value: string | null): string[] {
  return value ? [value] : [];
}

function toWorkoutExercise(
  draft: Pick<
    WorkoutExerciseDraft,
    'exerciseId' | 'sortOrder' | 'sets' | 'reps' | 'durationSeconds'
  >,
  catalog: ReadonlyMap<string, ExerciseView>,
): WorkoutExercise {
  const item = catalog.get(draft.exerciseId);
  const base = {
    id: `${draft.exerciseId}:${draft.sortOrder}`,
    backendExerciseId: draft.exerciseId,
    sortOrder: draft.sortOrder,
    name: item?.name ?? draft.exerciseId,
    muscleGroup: item?.muscleGroup ?? '',
    equipment: item?.equipment ?? '',
    instructions: splitInstructions(item?.instructions ?? null),
  };
  // The backend stores reps, weight and duration only; a timed prescription is tracked as duration.
  if (draft.reps === null && draft.durationSeconds !== null) {
    return {
      ...base,
      trackingType: 'duration',
      target: { sets: draft.sets ?? 1, durationSeconds: draft.durationSeconds, restSeconds: 30 },
    };
  }
  return {
    ...base,
    trackingType: 'strength',
    target: { sets: draft.sets ?? 1, reps: draft.reps ?? 10, loadKg: 0, restSeconds: 60 },
  };
}

export function planDayExercises(
  version: WorkoutVersionView | undefined,
  dayNumber: number | null,
  catalog: ReadonlyMap<string, ExerciseView>,
): WorkoutExercise[] {
  if (!version || dayNumber === null) return [];
  return version.exercises
    .filter((exercise) => exercise.dayNumber === dayNumber)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((exercise) => toWorkoutExercise(exercise, catalog));
}

/** Self-logged workout from catalog exercises: 3 × 10 targets the Member can change while logging. */
export function freeWorkoutExercises(
  exerciseIds: ReadonlyArray<string>,
  catalog: ReadonlyMap<string, ExerciseView>,
): WorkoutExercise[] {
  return exerciseIds.map((exerciseId, index) =>
    toWorkoutExercise(
      { exerciseId, sortOrder: index + 1, sets: 3, reps: 10, durationSeconds: null },
      catalog,
    ),
  );
}

function statusOf(day: ScheduledDay | undefined, businessDate: string): WorkoutDayStatus {
  if (!day) return 'none';
  switch (day.status) {
    case 'Completed':
      return 'completed';
    case 'Rest':
      return 'rest';
    case 'Paused':
      return 'paused';
    case 'Missed':
      return 'missed';
    case 'Upcoming':
      return 'upcoming';
    case 'Pending':
      return day.day === businessDate ? 'ready' : 'pending';
    default:
      return 'none';
  }
}

/** Monday–Sunday of the current UTC+7 business week, from the server-calculated CF05 schedule days. */
export function buildWorkoutWeek(
  days: ReadonlyArray<ScheduledDay>,
  businessDate: string,
  plans: PlansView | undefined,
  catalog: ReadonlyMap<string, ExerciseView>,
): WorkoutDayPlan[] {
  const monday = addBusinessDays(businessDate, 1 - isoWeekdayOf(businessDate));
  return WEEKDAY_NAMES.map((weekday, index) => {
    const date = addBusinessDays(monday, index);
    const scheduled = days.find((item) => item.day === date);
    const versionId = scheduled?.versionId ?? null;
    const dayNumber = scheduled?.expectedDayNumber ?? null;
    const version = findVersion(plans, versionId);
    return {
      id: date,
      dayNumber,
      versionId,
      weekday,
      isToday: date === businessDate,
      durationMinutes:
        version?.dayDurations.find((item) => item.dayNumber === dayNumber)?.estimatedMinutes ?? 0,
      status: statusOf(scheduled, businessDate),
      exercises: planDayExercises(version, dayNumber, catalog),
    };
  });
}

function toLogs(log: ExerciseLog | undefined): LogInput[] {
  if (!log) return [];
  const entry = (setNumber: number, values: Partial<LogInput>): LogInput => ({
    setNumber,
    repsCompleted: null,
    weightKg: null,
    durationSeconds: null,
    perceivedExertion: null,
    notes: null,
    ...values,
  });
  switch (log.trackingType) {
    case 'strength':
      return log.sets
        .filter((set) => set.completed && set.reps > 0)
        .map((set, index) =>
          entry(index + 1, {
            repsCompleted: set.reps,
            weightKg: set.loadKg,
            perceivedExertion: set.rpe ?? null,
          }),
        );
    case 'duration':
      return log.sets
        .filter((set) => set.completed && set.durationSeconds > 0)
        .map((set, index) => entry(index + 1, { durationSeconds: set.durationSeconds }));
    case 'distance':
      return log.durationSeconds > 0 ? [entry(1, { durationSeconds: log.durationSeconds })] : [];
    case 'interval':
      return log.completedRounds > 0
        ? [entry(1, { durationSeconds: log.completedRounds * log.workSeconds })]
        : [];
  }
}

export function hasLoggedSet(
  session: Pick<CompletedWorkoutSession, 'exercises' | 'logs'>,
): boolean {
  return session.exercises.some((exercise) => toLogs(session.logs[exercise.id]).length > 0);
}

export interface ServerSessionTotals {
  sets: number;
  volumeKg: number;
  durationSeconds: number;
}

/** Totals of a stored session, computed only from its recorded sets. */
export function serverSessionTotals(session: Pick<SessionView, 'exercises'>): ServerSessionTotals {
  return session.exercises
    .flatMap((exercise) => exercise.logs)
    .reduce<ServerSessionTotals>(
      (totals, log) => ({
        sets: totals.sets + 1,
        volumeKg: totals.volumeKg + (log.repsCompleted ?? 0) * (log.weightKg ?? 0),
        durationSeconds: totals.durationSeconds + (log.durationSeconds ?? 0),
      }),
      { sets: 0, volumeKg: 0, durationSeconds: 0 },
    );
}

/** Deterministic payload: a retry sends exactly the same content under the same ClientRequestId. */
export function toSessionInput(session: CompletedWorkoutSession): SessionInput {
  const plan = session.source.kind === 'plan' ? session.source : null;
  return {
    clientRequestId: session.id,
    workoutPlanVersionId: plan?.versionId ?? null,
    scheduledAtUtc: session.startedAt,
    notes: null,
    exercises: session.exercises.map((exercise) => ({
      exerciseId: exercise.backendExerciseId,
      sortOrder: exercise.sortOrder,
      logs: toLogs(session.logs[exercise.id]),
    })),
    activitySegments: [],
    planDayNumber: plan?.planDayNumber ?? null,
  };
}
