import { http, HttpResponse } from 'msw';

import type {
  BadgeAward,
  DistanceSummary,
  ProgressionHistory,
  ProgressionState,
  RecoveryInput,
  RecoveryReport,
  ScheduledDay,
  ScheduleOverview,
  TrainingPause,
} from '@/features/gamification/api/types';
import type {
  ExerciseView,
  PlansView,
  SessionInput,
  SessionView,
} from '@/features/workout-plans/api/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

// CF05 progression + CF01 live workout contract (ProgressionController / WorkoutController / GET /coaching/me/plans).
// Business date is pinned to a Tuesday (UTC+7) so the weekly schedule is deterministic regardless of the real clock.
export const MOCK_BUSINESS_DATE = '2026-10-20';
export const MOCK_VERSION_ID = 'plan-version-1';
const MOCK_PLAN_ID = 'plan-1';

const path = (p: string) => `*${p}`;

/**
 * E2E failure injection. Playwright's page.route() cannot see requests that MSW's service worker handles, so a
 * spec sets `sessionStorage['msw:fail']` to a comma-separated list of the names below to make that endpoint fail.
 */
export type MockFailure = 'progression-state' | 'workout-session-create';
const failing = (name: MockFailure): boolean => {
  try {
    return (window.sessionStorage.getItem('msw:fail') ?? '').split(',').includes(name);
  } catch {
    return false;
  }
};
const serverError = () =>
  HttpResponse.json({ isSuccess: false, message: 'Service unavailable' }, { status: 503 });
const ok = <T>(data: T, status = 200) =>
  HttpResponse.json({ isSuccess: true, message: 'OK', data }, { status });

export const mockExercises: ExerciseView[] = [
  {
    id: 'ex-bench-press',
    code: 'BENCH',
    name: 'Barbell Bench Press',
    equipment: 'Barbell',
    muscleGroup: 'Chest',
    instructions: null,
  },
  {
    id: 'ex-bent-over-row',
    code: 'ROW',
    name: 'Bent-over barbell row',
    equipment: 'Barbell',
    muscleGroup: 'Back',
    instructions: 'Hinge at the hips and row the bar to your lower ribs.',
  },
  {
    id: 'ex-dead-hang',
    code: 'HANG',
    name: 'Dead hang',
    equipment: 'Pull-up bar',
    muscleGroup: 'Back',
    instructions: null,
  },
];

const plans: PlansView = {
  workout: [
    {
      id: MOCK_PLAN_ID,
      name: 'Upper Body Hypertrophy',
      status: 'Active',
      managedByTrainerProfileId: null,
      versions: [
        {
          id: MOCK_VERSION_ID,
          versionNumber: 1,
          status: 'Active',
          name: 'Upper Body Hypertrophy v1',
          effectiveFromUtc: '2026-10-01T00:00:00Z',
          effectiveToUtc: null,
          exercises: [
            {
              exerciseId: 'ex-bench-press',
              dayNumber: 1,
              sortOrder: 1,
              sets: 3,
              reps: 8,
              durationSeconds: null,
              notes: null,
            },
            {
              exerciseId: 'ex-bent-over-row',
              dayNumber: 2,
              sortOrder: 1,
              sets: 3,
              reps: 10,
              durationSeconds: null,
              notes: null,
            },
            {
              exerciseId: 'ex-dead-hang',
              dayNumber: 2,
              sortOrder: 2,
              sets: 2,
              reps: null,
              durationSeconds: 45,
              notes: null,
            },
          ],
          dayDurations: [
            { dayNumber: 1, estimatedMinutes: 40 },
            { dayNumber: 2, estimatedMinutes: 35 },
          ],
        },
      ],
    },
  ],
};

const distance: DistanceSummary = {
  totalKm: null,
  primaryProvider: null,
  availableProviders: [],
  sourceSelectionRequired: false,
  quarantinedActivities: 0,
};

const badge: BadgeAward = {
  id: 'award-1',
  code: 'WORKOUT_COUNT',
  name: 'First steps',
  tier: 'Bronze',
  threshold: 1,
  reason: 'Completed your first scheduled workout',
  awardedAtUtc: '2026-10-19T10:00:00Z',
  seen: true,
  ruleVersion: 'cf05-proposed-2026-10-16',
};

// Mon 19 Completed (plan day 1), Tue 20 Pending (plan day 2, today), Thu 22 Upcoming (plan day 1); other days Rest.
function buildDays(todayCompleted: boolean): ScheduledDay[] {
  const rest = (day: string): ScheduledDay => ({
    day,
    status: 'Rest',
    expectedDayNumber: null,
    versionId: null,
  });
  return [
    {
      day: '2026-10-19',
      status: 'Completed',
      expectedDayNumber: 1,
      versionId: MOCK_VERSION_ID,
    },
    {
      day: '2026-10-20',
      status: todayCompleted ? 'Completed' : 'Pending',
      expectedDayNumber: 2,
      versionId: MOCK_VERSION_ID,
    },
    rest('2026-10-21'),
    {
      day: '2026-10-22',
      status: 'Upcoming',
      expectedDayNumber: 1,
      versionId: MOCK_VERSION_ID,
    },
    rest('2026-10-23'),
    rest('2026-10-24'),
    rest('2026-10-25'),
  ];
}

const sessions = new Map<string, SessionView>();
let isoWeekdays = [1, 2, 4];
let activePause: TrainingPause | null = null;
const recoveryReports: RecoveryReport[] = [];

const todayCompleted = () =>
  [...sessions.values()].some((session) => session.status === 'Completed');

function currentState(): ProgressionState {
  const done = todayCompleted();
  return {
    stateVersion: `v${sessions.size}`,
    businessDate: MOCK_BUSINESS_DATE,
    timeZone: 'UTC+07:00',
    ruleVersion: 'cf05-proposed-2026-10-16',
    streak: {
      current: done ? 2 : 1,
      best: 3,
      scheduleConfigured: true,
      today: done ? 'Completed' : 'Pending',
    },
    xp: {
      totalConfirmed: 150,
      pending: done
        ? [
            {
              businessDate: MOCK_BUSINESS_DATE,
              provisionalAmount: 50,
              rewardType: 'WorkoutCompleted',
              confirmsAtUtc: '2026-10-21T17:00:00Z',
            },
          ]
        : [],
    },
    completedWorkouts: done ? 2 : 1,
    distance,
    badges: [badge],
    nextBadges: [
      {
        code: 'WORKOUT_COUNT',
        name: 'Workout Milestone',
        tier: 'Silver',
        threshold: 10,
        current: 1,
      },
    ],
    activePause,
    days: buildDays(done),
  };
}

function scheduleOverview(): ScheduleOverview {
  return {
    current: {
      id: 'schedule-1',
      workoutPlanId: MOCK_PLAN_ID,
      isoWeekdays,
      effectiveFromDay: '2026-10-01',
      effectiveToDay: null,
    },
    upcoming: null,
    hasActivePlan: true,
    planDayNumbers: [1, 2],
    businessDate: MOCK_BUSINESS_DATE,
  };
}

function history(): ProgressionHistory {
  const done = todayCompleted();
  return {
    from: '2026-10-01',
    to: MOCK_BUSINESS_DATE,
    summary: {
      fitFlexWorkouts: done ? 2 : 1,
      ptSessions: 0,
      externalActivities: 0,
      distanceKm: 0,
      scheduledCompleted: done ? 2 : 1,
      scheduledMissed: 0,
      scheduledPaused: 0,
      xpConfirmed: 150,
    },
    items: [
      {
        type: 'FitFlexWorkout',
        id: 'history-1',
        occurredAtUtc: '2026-10-19T10:00:00Z',
        businessDate: '2026-10-19',
        title: 'Plan day 1',
        durationMinutes: 40,
        distanceKm: null,
        planDayNumber: 1,
        isMainSession: true,
        xpAwarded: 50,
        provider: null,
        countingNote: 'Counts for the scheduled-day streak.',
      },
    ],
    days: buildDays(done),
  };
}

function toSessionView(input: SessionInput): SessionView {
  return {
    id: `session-${input.clientRequestId}`,
    revision: 1,
    workoutPlanVersionId: input.workoutPlanVersionId,
    status: 'InProgress',
    scheduledAtUtc: input.scheduledAtUtc,
    completedAtUtc: null,
    notes: input.notes,
    exercises: input.exercises.map((exercise, index) => ({
      id: `${input.clientRequestId}-${index}`,
      exerciseId: exercise.exerciseId,
      sortOrder: exercise.sortOrder,
      plannedSets: null,
      plannedReps: null,
      plannedDurationSeconds: null,
      logs: exercise.logs,
    })),
  };
}

export const progressionHandlers = [
  http.get(path(ENDPOINTS.progression.state), () =>
    failing('progression-state') ? serverError() : ok(currentState()),
  ),
  http.get(path(ENDPOINTS.progression.history), () => ok(history())),
  http.get(path(ENDPOINTS.progression.schedule), () => ok(scheduleOverview())),
  http.put(path(ENDPOINTS.progression.schedule), async ({ request }) => {
    const body = (await request.json()) as { isoWeekdays: number[] };
    isoWeekdays = body.isoWeekdays;
    return ok(scheduleOverview());
  }),
  http.post(path(ENDPOINTS.progression.badgeSeen(':awardId')), () => ok({ ...badge, seen: true })),
];

// Endpoints absent from the persistent workout fixture remain available to CF05 screens.
export const supplementaryProgressionHandlers = [
  http.put(path(ENDPOINTS.progression.primaryDistanceSource), () => ok(distance)),
  http.get(path(ENDPOINTS.progression.recovery), () => ok(recoveryReports)),
  http.post(path(ENDPOINTS.progression.recovery), async ({ request }) => {
    const body = (await request.json()) as RecoveryInput;
    const report: RecoveryReport = {
      id: `recovery-${recoveryReports.length + 1}`,
      businessDate: MOCK_BUSINESS_DATE,
      reportedAtUtc: '2026-10-20T03:00:00Z',
      revision: 1,
      editable: true,
      ...body,
    };
    recoveryReports.unshift(report);
    return ok(report, 201);
  }),
  http.post(path(ENDPOINTS.progression.pause), async ({ request }) => {
    const body = (await request.json()) as {
      recoveryReportId: string | null;
      reason: string | null;
    };
    activePause = {
      id: 'pause-1',
      startDay: MOCK_BUSINESS_DATE,
      endDay: null,
      resumeProposedAtUtc: null,
      resumeProposalNote: null,
      ...body,
    };
    return ok(activePause, 201);
  }),
  http.post(path(ENDPOINTS.progression.resume), () => {
    const ended = { ...(activePause as TrainingPause), endDay: MOCK_BUSINESS_DATE };
    activePause = null;
    return ok(ended);
  }),
];

export const workoutHandlers = [
  http.get(path(ENDPOINTS.coaching.me.plans), () => ok(plans)),
  http.get(path(ENDPOINTS.workouts.exercises), () => ok(mockExercises)),
  http.get(path(ENDPOINTS.workouts.sessions), () => ok([...sessions.values()])),
  // Idempotent by clientRequestId, like the backend: a retry returns the stored session.
  http.post(path(ENDPOINTS.workouts.sessions), async ({ request }) => {
    if (failing('workout-session-create')) return serverError();
    const input = (await request.json()) as SessionInput;
    const existing = sessions.get(input.clientRequestId);
    if (existing) return ok(existing);
    const created = toSessionView(input);
    sessions.set(input.clientRequestId, created);
    return ok(created, 201);
  }),
  http.post(path(ENDPOINTS.workouts.complete(':sessionId')), async ({ params, request }) => {
    const body = (await request.json()) as { completedAtUtc: string };
    const stored = [...sessions.entries()].find(([, item]) => item.id === params.sessionId);
    if (!stored) return HttpResponse.json({ message: 'Session not found' }, { status: 404 });
    const completed: SessionView = {
      ...stored[1],
      status: 'Completed',
      completedAtUtc: body.completedAtUtc,
    };
    sessions.set(stored[0], completed);
    return ok(completed);
  }),
];
