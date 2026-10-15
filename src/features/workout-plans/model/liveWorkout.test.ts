import { describe, expect, it, vi } from 'vitest';

import type { ExerciseView, PlansView } from '../api/types';

import {
  addBusinessDays,
  buildWorkoutWeek,
  freeWorkoutExercises,
  hasLoggedSet,
  serverSessionTotals,
  toSessionInput,
} from './liveWorkout';
import type { CompletedWorkoutSession } from './workoutFlowTypes';
import { syncCompletedSession } from './workoutSync';

import { ApiError, NetworkError } from '@/shared/api/errorTypes';

const catalog = new Map<string, ExerciseView>([
  [
    'sq',
    {
      id: 'sq',
      code: 'CF01-BW-SQUAT',
      name: 'Bodyweight squat',
      equipment: 'Bodyweight',
      muscleGroup: 'Quadriceps',
      instructions: 'Squat.',
    },
  ],
  [
    'pl',
    {
      id: 'pl',
      code: 'CF01-BW-PLANK',
      name: 'Forearm plank',
      equipment: 'Bodyweight',
      muscleGroup: 'Core',
      instructions: null,
    },
  ],
]);

const plans: PlansView = {
  workout: [
    {
      id: 'p1',
      name: 'Plan',
      status: 'Active',
      managedByTrainerProfileId: null,
      versions: [
        {
          id: 'v1',
          versionNumber: 1,
          status: 'Active',
          effectiveFromUtc: '2026-09-01T00:00:00Z',
          effectiveToUtc: null,
          name: 'Plan',
          dayDurations: [{ dayNumber: 1, estimatedMinutes: 30 }],
          exercises: [
            {
              exerciseId: 'pl',
              dayNumber: 1,
              sortOrder: 2,
              sets: 3,
              reps: null,
              durationSeconds: 45,
              notes: null,
            },
            {
              exerciseId: 'sq',
              dayNumber: 1,
              sortOrder: 1,
              sets: 3,
              reps: 12,
              durationSeconds: null,
              notes: null,
            },
            {
              exerciseId: 'sq',
              dayNumber: 2,
              sortOrder: 1,
              sets: 4,
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

describe('live workout week', () => {
  it('builds Monday–Sunday of the UTC+7 business week from server schedule days', () => {
    const week = buildWorkoutWeek(
      [
        { day: '2026-10-05', status: 'Completed', expectedDayNumber: 2, versionId: 'v1' },
        { day: '2026-10-06', status: 'Rest', expectedDayNumber: null, versionId: 'v1' },
        { day: '2026-10-07', status: 'Pending', expectedDayNumber: 1, versionId: 'v1' },
        { day: '2026-10-08', status: 'Upcoming', expectedDayNumber: 2, versionId: 'v1' },
      ],
      '2026-10-07',
      plans,
      catalog,
    );
    expect(week.map((d) => d.id)).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]);
    expect(week.map((d) => d.status)).toEqual([
      'completed',
      'rest',
      'ready',
      'upcoming',
      'none',
      'none',
      'none',
    ]);
    const today = week[2]!;
    expect(today.isToday).toBe(true);
    expect(today.durationMinutes).toBe(30);
    expect(today.exercises.map((e) => [e.name, e.trackingType, e.sortOrder])).toEqual([
      ['Bodyweight squat', 'strength', 1],
      ['Forearm plank', 'duration', 2],
    ]);
  });

  it('marks a past pending day as waiting for sync, not startable', () => {
    const week = buildWorkoutWeek(
      [{ day: '2026-10-06', status: 'Pending', expectedDayNumber: 1, versionId: 'v1' }],
      '2026-10-07',
      plans,
      catalog,
    );
    expect(week[1]?.status).toBe('pending');
  });

  it('crosses month boundaries without timezone drift', () => {
    expect(addBusinessDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addBusinessDays('2026-11-01', -1)).toBe('2026-10-31');
  });
});

function completed(overrides: Partial<CompletedWorkoutSession> = {}): CompletedWorkoutSession {
  const [squat, plank] = buildWorkoutWeek(
    [{ day: '2026-10-07', status: 'Pending', expectedDayNumber: 1, versionId: 'v1' }],
    '2026-10-07',
    plans,
    catalog,
  ).find((d) => d.isToday)!.exercises;
  return {
    id: 'client-request-1',
    dayId: '2026-10-07',
    source: { kind: 'plan', versionId: 'v1', planDayNumber: 1, businessDate: '2026-10-07' },
    title: 'Day 1',
    exercises: [squat!, plank!],
    startedAt: '2026-10-07T01:00:00.000Z',
    currentExerciseIndex: 1,
    logs: {
      [squat!.id]: {
        trackingType: 'strength',
        sets: [
          { setNumber: 1, reps: 12, loadKg: 0, rpe: 7, completed: true },
          { setNumber: 2, reps: 0, loadKg: 0, completed: true },
          { setNumber: 3, reps: 10, loadKg: 5, completed: false },
        ],
      },
    },
    completedAt: '2026-10-07T01:40:00.000Z',
    totals: { totalVolumeKg: 0, totalDurationSeconds: 0, totalDistanceKm: 0, completedRounds: 0 },
    sync: { status: 'pending', backendSessionId: null, error: null },
    ...overrides,
  };
}

describe('session payload', () => {
  it('sends only real sets, keeps plan linkage and is identical on every retry', () => {
    const input = toSessionInput(completed());
    expect(input).toEqual(toSessionInput(completed()));
    expect(input.clientRequestId).toBe('client-request-1');
    expect(input.workoutPlanVersionId).toBe('v1');
    expect(input.planDayNumber).toBe(1);
    expect(input.scheduledAtUtc).toBe('2026-10-07T01:00:00.000Z');
    expect(input.exercises[0]).toEqual({
      exerciseId: 'sq',
      sortOrder: 1,
      logs: [
        {
          setNumber: 1,
          repsCompleted: 12,
          weightKg: 0,
          durationSeconds: null,
          perceivedExertion: 7,
          notes: null,
        },
      ],
    });
    expect(input.exercises[1]?.logs).toEqual([]);
  });

  it('free workouts have no plan link and require at least one logged set', () => {
    const free = completed({
      source: { kind: 'free' },
      exercises: freeWorkoutExercises(['sq'], catalog),
      logs: {},
    });
    expect(toSessionInput(free).workoutPlanVersionId).toBeNull();
    expect(toSessionInput(free).planDayNumber).toBeNull();
    expect(hasLoggedSet(free)).toBe(false);
    expect(hasLoggedSet(completed())).toBe(true);
  });

  it('totals stored sessions from their recorded sets', () => {
    expect(
      serverSessionTotals({
        exercises: [
          {
            id: 'a',
            exerciseId: 'sq',
            sortOrder: 1,
            plannedSets: 3,
            plannedReps: 10,
            plannedDurationSeconds: null,
            logs: [
              {
                setNumber: 1,
                repsCompleted: 10,
                weightKg: 20,
                durationSeconds: null,
                perceivedExertion: null,
                notes: null,
              },
            ],
          },
          {
            id: 'b',
            exerciseId: 'pl',
            sortOrder: 2,
            plannedSets: 1,
            plannedReps: null,
            plannedDurationSeconds: 45,
            logs: [
              {
                setNumber: 1,
                repsCompleted: null,
                weightKg: null,
                durationSeconds: 50,
                perceivedExertion: null,
                notes: null,
              },
            ],
          },
        ],
      }),
    ).toEqual({ sets: 2, volumeKg: 200, durationSeconds: 50 });
  });
});

describe('workout sync', () => {
  const view = { id: 'server-1' } as never;

  it('creates then completes with the device completion time', async () => {
    const api = {
      createSession: vi.fn().mockResolvedValue(view),
      completeSession: vi.fn().mockResolvedValue(view),
    };
    const onCreated = vi.fn();
    const result = await syncCompletedSession(completed(), api, onCreated);
    expect(result).toEqual({ status: 'synced', backendSessionId: 'server-1', error: null });
    expect(onCreated).toHaveBeenCalledWith('server-1');
    expect(api.completeSession).toHaveBeenCalledWith('server-1', '2026-10-07T01:40:00.000Z');
  });

  it('retries only the completion when the session was already created', async () => {
    const api = { createSession: vi.fn(), completeSession: vi.fn().mockResolvedValue(view) };
    const result = await syncCompletedSession(
      completed({ sync: { status: 'pending', backendSessionId: 'server-1', error: null } }),
      api,
    );
    expect(api.createSession).not.toHaveBeenCalled();
    expect(result.status).toBe('synced');
  });

  it('keeps network failures pending and marks validation rejections permanent', async () => {
    const offline = {
      createSession: vi.fn().mockRejectedValue(new NetworkError()),
      completeSession: vi.fn(),
    };
    expect((await syncCompletedSession(completed(), offline)).status).toBe('pending');
    const late = {
      createSession: vi.fn().mockResolvedValue(view),
      completeSession: vi
        .fn()
        .mockRejectedValue(new ApiError(400, 'outside window', 'CompletedAtOutsideSyncWindow')),
    };
    const result = await syncCompletedSession(completed(), late);
    expect(result).toEqual({
      status: 'rejected',
      backendSessionId: 'server-1',
      error: 'outside window',
    });
    const server = {
      createSession: vi.fn().mockRejectedValue(new ApiError(503, 'down')),
      completeSession: vi.fn(),
    };
    expect((await syncCompletedSession(completed(), server)).status).toBe('pending');
  });
});
