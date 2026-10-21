import { beforeEach, describe, expect, it } from 'vitest';

import {
  calculateWorkoutTotals,
  trimRecent,
  useWorkoutSessionStore,
} from './useWorkoutSessionStore';
import type { CompletedWorkoutSession, WorkoutExercise } from './workoutFlowTypes';

const squat: WorkoutExercise = {
  id: 'ex-1:1',
  backendExerciseId: 'ex-1',
  sortOrder: 1,
  name: 'Bodyweight squat',
  muscleGroup: 'Quadriceps',
  equipment: 'Bodyweight',
  instructions: [],
  trackingType: 'strength',
  target: { sets: 3, reps: 10, loadKg: 0, restSeconds: 60 },
};

describe('workout session store', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.setItem('gmc.session', JSON.stringify({ user: { id: 'workout-store-test' } }));
    useWorkoutSessionStore.setState({ activeSession: null, completedSessions: [] });
  });

  it('derives completion totals only from recorded actuals', () => {
    const totals = calculateWorkoutTotals({
      strength: {
        trackingType: 'strength',
        sets: [
          { setNumber: 1, reps: 10, loadKg: 60, completed: true },
          { setNumber: 2, reps: 8, loadKg: 60, completed: true },
        ],
      },
      duration: {
        trackingType: 'duration',
        sets: [{ setNumber: 1, durationSeconds: 45, completed: true }],
      },
    });
    expect(totals).toEqual({
      totalVolumeKg: 1080,
      totalDurationSeconds: 45,
      totalDistanceKm: 0,
      completedRounds: 0,
    });
  });

  it('snapshots exercises at start, keeps logs and persists the session', () => {
    const id = useWorkoutSessionStore.getState().startSession({
      dayId: '2026-10-06',
      source: { kind: 'plan', versionId: 'v1', planDayNumber: 1, businessDate: '2026-10-06' },
      title: 'Day 1',
      exercises: [squat],
    });
    expect(
      useWorkoutSessionStore.getState().startSession({
        dayId: '2026-10-06',
        source: { kind: 'free' },
        title: 'other',
        exercises: [],
      }),
    ).toBe(id);
    useWorkoutSessionStore.getState().saveExerciseLog(squat.id, {
      trackingType: 'strength',
      sets: [{ setNumber: 1, reps: 10, loadKg: 0, completed: true }],
    });
    const active = useWorkoutSessionStore.getState().activeSession;
    expect(active?.exercises).toEqual([squat]);
    expect(
      localStorage.getItem('fit:member-workout-session:v2:account:workout-store-test'),
    ).toContain(squat.id);
  });

  it('finishes into a pending outbox entry that keeps the device completion time', () => {
    useWorkoutSessionStore.getState().startSession({
      dayId: 'free',
      source: { kind: 'free' },
      title: 'Free workout',
      exercises: [squat],
    });
    const completed = useWorkoutSessionStore.getState().finishSession();
    expect(completed?.sync).toEqual({ status: 'pending', backendSessionId: null, error: null });
    expect(completed?.completedAt).toMatch(/Z$/);
    expect(useWorkoutSessionStore.getState().activeSession).toBeNull();
  });

  it('never trims unsynced workouts', () => {
    const entry = (id: string, status: CompletedWorkoutSession['sync']['status']) =>
      ({ id, sync: { status, backendSessionId: null, error: null } }) as CompletedWorkoutSession;
    const list = [
      ...Array.from({ length: 25 }, (_, i) => entry(`s${i}`, 'synced')),
      entry('pending', 'pending'),
      entry('rejected', 'rejected'),
    ];
    const trimmed = trimRecent(list);
    expect(trimmed.filter((x) => x.sync.status === 'synced')).toHaveLength(20);
    expect(trimmed.map((x) => x.id)).toEqual(expect.arrayContaining(['pending', 'rejected']));
  });
});
