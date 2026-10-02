import { beforeEach, describe, expect, it } from 'vitest';

import { calculateWorkoutTotals, useWorkoutSessionStore } from './useWorkoutSessionStore';

describe('workout session store', () => {
  beforeEach(() => {
    localStorage.clear();
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
      distance: { trackingType: 'distance', distanceKm: 2, durationSeconds: 600 },
      interval: {
        trackingType: 'interval',
        completedRounds: 4,
        workSeconds: 20,
        restSeconds: 10,
      },
    });

    expect(totals).toEqual({
      totalVolumeKg: 1080,
      totalDurationSeconds: 755,
      totalDistanceKm: 2,
      completedRounds: 4,
    });
  });

  it('keeps actual logs when navigating between exercises', () => {
    useWorkoutSessionStore.getState().startSession('tuesday-back-lats');
    useWorkoutSessionStore.getState().saveExerciseLog('dead-hang', {
      trackingType: 'duration',
      sets: [{ setNumber: 1, durationSeconds: 52, completed: true }],
    });
    useWorkoutSessionStore.getState().goToExercise(2);

    const active = useWorkoutSessionStore.getState().activeSession;
    expect(active?.currentExerciseIndex).toBe(2);
    expect(active?.logs['dead-hang']).toEqual({
      trackingType: 'duration',
      sets: [{ setNumber: 1, durationSeconds: 52, completed: true }],
    });
    expect(localStorage.getItem('fit:member-workout-session:v1')).toContain('dead-hang');
  });
});
