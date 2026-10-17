import { http, HttpResponse } from 'msw';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors CoachingController GET me/plans and WorkoutController /workouts/** (CF01) for the Member workout flow.
// State lives in memory: a page reload keeps it, a new browser context starts fresh.
const path = (p: string) => `*${p}`;

const ok = (data: unknown, status = 200) =>
  HttpResponse.json({ isSuccess: true, message: `${status}: OK`, data }, { status });

const fail = (status: number, errorCode: string, message: string) =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode }, { status });

export const MOCK_PLAN_ID = 'plan-demo';
export const MOCK_VERSION_ID = 'plan-demo-v1';

export const mockExercises = [
  {
    id: 'ex-row',
    code: 'bent-over-row',
    name: 'Bent-over barbell row',
    equipment: 'Barbell',
    muscleGroup: 'Back',
    instructions: 'Hinge at the hips and pull the bar to the lower ribs.',
  },
  {
    id: 'ex-hang',
    code: 'dead-hang',
    name: 'Dead hang',
    equipment: 'Pull-up bar',
    muscleGroup: 'Back',
    instructions: 'Hang with straight arms and a packed shoulder.',
  },
  {
    id: 'ex-bench',
    code: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    equipment: 'Barbell',
    muscleGroup: 'Chest',
    instructions: 'Lower the bar to the chest and press up.',
  },
];

const plans = {
  workout: [
    {
      id: MOCK_PLAN_ID,
      name: 'Back and chest block',
      status: 'Active',
      managedByTrainerProfileId: null,
      versions: [
        {
          id: MOCK_VERSION_ID,
          versionNumber: 1,
          status: 'Active',
          effectiveFromUtc: '2026-10-01T00:00:00.000Z',
          effectiveToUtc: null,
          name: 'Back and chest block',
          exercises: [
            {
              exerciseId: 'ex-row',
              dayNumber: 1,
              sortOrder: 1,
              sets: 3,
              reps: 10,
              durationSeconds: null,
              notes: null,
            },
            {
              exerciseId: 'ex-hang',
              dayNumber: 1,
              sortOrder: 2,
              sets: 2,
              reps: null,
              durationSeconds: 45,
              notes: null,
            },
            {
              exerciseId: 'ex-bench',
              dayNumber: 2,
              sortOrder: 1,
              sets: 3,
              reps: 8,
              durationSeconds: null,
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
  nutrition: [],
};

interface StoredLog {
  setNumber: number;
  repsCompleted: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  perceivedExertion: number | null;
  notes: string | null;
}

interface StoredSession {
  id: string;
  clientRequestId: string;
  revision: number;
  workoutPlanVersionId: string | null;
  planDayNumber: number | null;
  status: 'InProgress' | 'Completed';
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
    logs: StoredLog[];
  }>;
}

export const mockSessions: StoredSession[] = [];

export function resetMockWorkouts() {
  mockSessions.length = 0;
}

export const workoutHandlers = [
  http.get(path(ENDPOINTS.coaching.me.plans), () => ok(plans)),
  http.get(path(ENDPOINTS.workouts.exercises), () => ok(mockExercises)),
  http.get(path(ENDPOINTS.workouts.sessions), () => ok([...mockSessions].reverse())),

  http.post(path(ENDPOINTS.workouts.sessions), async ({ request }) => {
    const input = (await request.json()) as {
      clientRequestId: string;
      workoutPlanVersionId: string | null;
      planDayNumber: number | null;
      scheduledAtUtc: string;
      notes: string | null;
      exercises: Array<{ exerciseId: string; sortOrder: number; logs: StoredLog[] }>;
    };
    const existing = mockSessions.find((item) => item.clientRequestId === input.clientRequestId);
    if (existing) return ok(existing);
    const session: StoredSession = {
      id: `session-${mockSessions.length + 1}`,
      clientRequestId: input.clientRequestId,
      revision: 1,
      workoutPlanVersionId: input.workoutPlanVersionId,
      planDayNumber: input.planDayNumber,
      status: 'InProgress',
      scheduledAtUtc: input.scheduledAtUtc,
      completedAtUtc: null,
      notes: input.notes,
      exercises: input.exercises.map((exercise, index) => ({
        id: `session-${mockSessions.length + 1}-ex-${index + 1}`,
        exerciseId: exercise.exerciseId,
        sortOrder: exercise.sortOrder,
        plannedSets: null,
        plannedReps: null,
        plannedDurationSeconds: null,
        logs: exercise.logs,
      })),
    };
    mockSessions.push(session);
    return ok(session, 201);
  }),

  http.post(path('/workouts/me/sessions/:sessionId/complete'), async ({ params, request }) => {
    const session = mockSessions.find((item) => item.id === params.sessionId);
    if (!session) return fail(404, 'NotFound', 'Session not found.');
    if (session.status === 'Completed') return ok(session);
    if (!session.exercises.some((exercise) => exercise.logs.length > 0))
      return fail(400, 'Invalid', 'Log at least one set before completing.');
    const body = (await request.json().catch(() => null)) as { completedAtUtc?: string } | null;
    session.status = 'Completed';
    session.completedAtUtc = body?.completedAtUtc ?? new Date().toISOString();
    session.revision += 1;
    return ok(session);
  }),
];
