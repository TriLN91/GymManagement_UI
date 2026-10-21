import { delay, http, HttpResponse } from 'msw';

import type { ProgressionState, ScheduleOverview } from '@/features/gamification/api/types';
import type {
  ExerciseView,
  PlansView,
  SessionInput,
  SessionView,
} from '@/features/workout-plans/api/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

// Deterministic API fixtures, loaded only with MSW; these are never a product fallback.
export const mockBusinessDate = '2026-10-20';
const versionId = '10000000-0000-4000-8000-000000000001';
export const mockCatalog: ExerciseView[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    code: 'HIP-HINGE',
    name: 'Hip hinge',
    equipment: 'Bodyweight',
    muscleGroup: 'Hips',
    instructions: 'Move under control.',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    code: 'DEAD-HANG',
    name: 'Dead hang',
    equipment: 'Pull-up bar',
    muscleGroup: 'Back',
    instructions: 'Breathe steadily.',
  },
  {
    id: '20000000-0000-4000-8000-000000000003',
    code: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    equipment: 'Barbell',
    muscleGroup: 'Chest',
    instructions: 'Use a controlled load.',
  },
];
export const mockPlans: PlansView = {
  workout: [
    {
      id: '30000000-0000-4000-8000-000000000001',
      name: 'Member API plan',
      status: 'Active',
      managedByTrainerProfileId: null,
      versions: [
        {
          id: versionId,
          versionNumber: 1,
          status: 'Active',
          effectiveFromUtc: '2026-10-01T00:00:00Z',
          effectiveToUtc: null,
          name: 'Member API plan',
          dayDurations: [
            { dayNumber: 1, estimatedMinutes: 30 },
            { dayNumber: 2, estimatedMinutes: 30 },
          ],
          exercises: [
            {
              exerciseId: mockCatalog[0]!.id,
              dayNumber: 1,
              sortOrder: 1,
              sets: 2,
              reps: 8,
              durationSeconds: null,
              notes: null,
            },
            {
              exerciseId: mockCatalog[1]!.id,
              dayNumber: 1,
              sortOrder: 2,
              sets: 2,
              reps: null,
              durationSeconds: 60,
              notes: null,
            },
            {
              exerciseId: mockCatalog[0]!.id,
              dayNumber: 2,
              sortOrder: 1,
              sets: 2,
              reps: 8,
              durationSeconds: null,
              notes: null,
            },
          ],
        },
      ],
    },
  ],
};
export const mockProgression: ProgressionState = {
  stateVersion: 'fixture-v1',
  businessDate: mockBusinessDate,
  timeZone: 'UTC+07:00',
  ruleVersion: 'cf05-proposed-2026-10-16',
  streak: { current: 4, best: 9, scheduleConfigured: true, today: 'Pending' },
  xp: { totalConfirmed: 150, pending: [] },
  completedWorkouts: 12,
  distance: {
    totalKm: null,
    primaryProvider: null,
    availableProviders: [],
    sourceSelectionRequired: false,
    quarantinedActivities: 0,
  },
  badges: [
    {
      id: 'badge-1',
      code: 'WORKOUT_COUNT',
      name: 'Workout Milestone',
      tier: 'Bronze',
      threshold: 10,
      reason: 'Completed 10 workouts',
      awardedAtUtc: '2026-10-19T03:00:00Z',
      seen: true,
      ruleVersion: 'cf05-proposed-2026-10-16',
    },
  ],
  nextBadges: [
    {
      code: 'WORKOUT_COUNT',
      name: 'Workout Milestone',
      tier: 'Silver',
      threshold: 20,
      current: 12,
    },
  ],
  activePause: null,
  days: [
    { day: '2026-10-19', status: 'Completed', expectedDayNumber: 2, versionId },
    { day: mockBusinessDate, status: 'Pending', expectedDayNumber: 1, versionId },
    { day: '2026-10-21', status: 'Upcoming', expectedDayNumber: 2, versionId },
    { day: '2026-10-22', status: 'Rest', expectedDayNumber: null },
    { day: '2026-10-23', status: 'Upcoming', expectedDayNumber: 1, versionId },
    { day: '2026-10-24', status: 'Upcoming', expectedDayNumber: 2, versionId },
    { day: '2026-10-25', status: 'Rest', expectedDayNumber: null },
  ],
};
const schedule: ScheduleOverview = {
  current: {
    id: 'schedule-1',
    workoutPlanId: mockPlans.workout[0]!.id,
    isoWeekdays: [1, 2, 3, 5, 6],
    effectiveFromDay: '2026-10-01',
    effectiveToDay: null,
  },
  upcoming: null,
  hasActivePlan: true,
  planDayNumbers: [1, 2],
  businessDate: mockBusinessDate,
};
type Stored = { sessions: SessionView[]; requests: Record<string, string>; completedMain: boolean };
function key() {
  const auth = JSON.parse(localStorage.getItem('app:auth') ?? '{}') as {
    state?: { user?: { id?: string } };
  };
  return `fitflex:mock-workouts:${auth.state?.user?.id ?? 'anonymous'}`;
}
function load(): Stored {
  return JSON.parse(
    localStorage.getItem(key()) ?? '{"sessions":[],"requests":{},"completedMain":false}',
  ) as Stored;
}
function save(value: Stored) {
  localStorage.setItem(key(), JSON.stringify(value));
}
const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: 'Mock API success', data });
const fail = (status: number, code: string) =>
  HttpResponse.json({ isSuccess: false, errorCode: code, message: code, data: null }, { status });
const path = (p: string) => `*${p}`;
export const workoutHandlers = [
  http.get(path(ENDPOINTS.progression.state), async () => {
    await delay(120);
    if (sessionStorage.getItem('fitflex:mock:progression-fail'))
      return fail(503, 'ProgressionUnavailable');
    const state = structuredClone(mockProgression);
    if (load().completedMain) {
      state.days.find((d) => d.day === mockBusinessDate)!.status = 'Completed';
      state.streak.today = 'Completed';
    }
    return ok(state);
  }),
  http.get(path(ENDPOINTS.progression.schedule), () => ok(schedule)),
  http.put(path(ENDPOINTS.progression.schedule), async ({ request }) => {
    const body = (await request.json()) as { isoWeekdays: number[] };
    return ok({
      ...schedule,
      upcoming: {
        ...schedule.current,
        id: 'upcoming',
        isoWeekdays: body.isoWeekdays,
        effectiveFromDay: '2026-10-21',
      },
    });
  }),
  http.get(path(ENDPOINTS.progression.recovery), () => ok([])),
  http.get(path(ENDPOINTS.progression.history), () =>
    ok({
      from: '2026-09-20',
      to: mockBusinessDate,
      summary: {
        fitFlexWorkouts: 12,
        ptSessions: 0,
        externalActivities: 0,
        distanceKm: 0,
        scheduledCompleted: 1,
        scheduledMissed: 0,
        scheduledPaused: 0,
        xpConfirmed: 150,
      },
      items: [],
      days: mockProgression.days,
    }),
  ),
  http.post('*/progression/me/badges/:id/seen', () => ok(mockProgression.badges[0])),
  http.get(path(ENDPOINTS.coaching.me.plans), () => ok(mockPlans)),
  http.get(path(ENDPOINTS.workouts.exercises), () => ok(mockCatalog)),
  http.get(path(ENDPOINTS.workouts.sessions), () => ok(load().sessions)),
  http.post(path(ENDPOINTS.workouts.sessions), async ({ request }) => {
    if (sessionStorage.getItem('fitflex:mock:creation-fail'))
      return fail(503, 'SessionCreateUnavailable');
    const body = (await request.json()) as SessionInput;
    const state = load();
    const old = state.sessions.find((s) => s.id === state.requests[body.clientRequestId]);
    if (old) return ok(old);
    if (body.exercises.some((e) => !mockCatalog.some((c) => c.id === e.exerciseId)))
      return fail(400, 'UnknownExercise');
    const session: SessionView = {
      id: crypto.randomUUID(),
      revision: 1,
      workoutPlanVersionId: body.workoutPlanVersionId,
      status: 'Planned',
      scheduledAtUtc: body.scheduledAtUtc,
      completedAtUtc: null,
      notes: body.notes,
      exercises: body.exercises.map((e) => ({
        ...e,
        id: crypto.randomUUID(),
        plannedSets: null,
        plannedReps: null,
        plannedDurationSeconds: null,
      })),
    };
    state.sessions.push(session);
    state.requests[body.clientRequestId] = session.id;
    save(state);
    return ok(session);
  }),
  http.post('*/workouts/me/sessions/:id/complete', async ({ params, request }) => {
    if (sessionStorage.getItem('fitflex:mock:completion-fail'))
      return fail(503, 'UploadUnavailable');
    const state = load();
    const session = state.sessions.find((s) => s.id === params.id);
    if (!session) return fail(404, 'SessionNotFound');
    const body = (await request.json()) as { completedAtUtc: string };
    if (session.status !== 'Completed') {
      session.status = 'Completed';
      session.completedAtUtc = body.completedAtUtc;
      session.revision++;
      if (session.workoutPlanVersionId) state.completedMain = true;
      save(state);
    }
    return ok(session);
  }),
];
