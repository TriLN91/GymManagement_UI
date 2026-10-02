import { describe, expect, it } from 'vitest';

import { calculateAchievementProgress } from './achievementProgress';

import type { CompletedWorkoutSession } from '@/features/workout-plans/model/workoutFlowTypes';

function strengthSession(id: string, completedAt: string, loadKg: number): CompletedWorkoutSession {
  return {
    id,
    dayId: 'upper-body',
    startedAt: completedAt,
    completedAt,
    currentExerciseIndex: 0,
    totals: {
      totalVolumeKg: loadKg * 10,
      totalDurationSeconds: 0,
      totalDistanceKm: 0,
      completedRounds: 0,
    },
    logs: {
      bench: {
        trackingType: 'strength',
        sets: [{ setNumber: 1, reps: 10, loadKg, completed: true }],
      },
    },
  };
}

describe('achievement progress', () => {
  it('counts current activity streak and period progress', () => {
    const sessions = [
      strengthSession('one', '2026-09-24T10:00:00+07:00', 40),
      strengthSession('two', '2026-09-25T10:00:00+07:00', 45),
      strengthSession('three', '2026-09-26T10:00:00+07:00', 50),
    ];

    const result = calculateAchievementProgress(sessions, new Date('2026-09-26T15:00:00+07:00'));

    expect(result.currentStreak).toBe(3);
    expect(result.sessionsThisWeek).toBe(3);
    expect(result.sessionsThisMonth).toBe(3);
    expect(result.recordBreaks).toBe(2);
    expect(result.highestLoadKg).toBe(50);
  });

  it('does not present an old streak as current', () => {
    const sessions = [strengthSession('old', '2026-08-01T10:00:00+07:00', 40)];

    expect(
      calculateAchievementProgress(sessions, new Date('2026-09-26T15:00:00+07:00')).currentStreak,
    ).toBe(0);
  });
});
