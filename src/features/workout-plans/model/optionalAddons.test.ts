import { describe, expect, it } from 'vitest';

import { optionalExercisesFor, optionalTargetLabel } from './optionalAddons';

import type {
  BuilderExercise,
  OptionalExerciseLayer,
} from '@/features/member-workout-builder/model/useMemberWorkoutBuilderStore';

const exercise = (overrides: Partial<BuilderExercise>): BuilderExercise => ({
  uid: 'u1',
  exerciseId: 'barbell-bench-press',
  sets: 3,
  reps: 10,
  loadKg: 42.5,
  restSeconds: 60,
  durationSeconds: 0,
  distanceKm: 0,
  rounds: 0,
  workSeconds: 0,
  days: ['monday'],
  ...overrides,
});

const addon = (exercises: BuilderExercise[]): OptionalExerciseLayer => ({
  id: 'optional-1',
  name: 'Monday chest add-on',
  exercises,
  savedAt: '2026-10-19T00:00:00Z',
  status: 'active',
  sourcePlanName: 'AI/PT Active Plan',
  affectsPlanCompletion: false,
});

describe('optionalExercisesFor', () => {
  it('returns only the exercises scheduled on that weekday', () => {
    const layers = [addon([exercise({}), exercise({ uid: 'u2', days: ['wednesday'] })])];
    expect(optionalExercisesFor(layers, 'monday')).toHaveLength(1);
    expect(optionalExercisesFor(layers, 'tuesday')).toHaveLength(0);
  });

  it('skips exercises that are no longer in the builder catalog', () => {
    expect(optionalExercisesFor([addon([exercise({ exerciseId: 'gone' })])], 'monday')).toEqual([]);
  });

  it('formats the strength target', () => {
    const [entry] = optionalExercisesFor([addon([exercise({})])], 'monday');
    expect(optionalTargetLabel(entry!.exercise, entry!.item)).toBe('3 × 10 @ 42.5 kg');
  });
});
