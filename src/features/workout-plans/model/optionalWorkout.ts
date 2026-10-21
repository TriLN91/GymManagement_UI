import type { ExerciseView } from '../api/types';

import type { WorkoutExercise } from './workoutFlowTypes';

import {
  memberExerciseCatalog,
  type OptionalExerciseLayer,
  type Weekday,
} from '@/features/member-workout-builder/model/useMemberWorkoutBuilderStore';

/** Optional sets are self-logged workouts: never link them to an AI/PT plan day. */
export function optionalWorkout(
  layer: OptionalExerciseLayer,
  weekday: Weekday,
  catalog: ReadonlyMap<string, ExerciseView>,
) {
  const exercises: WorkoutExercise[] = [];
  const unavailable: string[] = [];
  for (const draft of layer.exercises.filter((e) => e.days.includes(weekday))) {
    const item = memberExerciseCatalog.find((c) => c.id === draft.exerciseId);
    if (!item) {
      unavailable.push(draft.exerciseId);
      continue;
    }
    const candidates = [...catalog.values()].filter(
      (c) =>
        c.id === item.id ||
        c.code?.toLowerCase() === item.id.toLowerCase() ||
        c.name.toLowerCase() === item.name.en.toLowerCase(),
    );
    const match = candidates.length === 1 ? candidates[0] : undefined;
    // Do not invent IDs or silently discard distance/round data the API cannot represent.
    if (!match || (item.trackingType !== 'strength' && item.trackingType !== 'duration')) {
      unavailable.push(item.name.en);
      continue;
    }
    const base = {
      id: `${layer.id}:${draft.uid}`,
      backendExerciseId: match.id,
      sortOrder: exercises.length + 1,
      name: match.name,
      muscleGroup: match.muscleGroup ?? '',
      equipment: match.equipment ?? '',
      instructions: match.instructions ? [match.instructions] : [],
    };
    exercises.push(
      item.trackingType === 'strength'
        ? {
            ...base,
            trackingType: 'strength',
            target: {
              sets: draft.sets,
              reps: draft.reps,
              loadKg: draft.loadKg,
              restSeconds: draft.restSeconds,
            },
          }
        : {
            ...base,
            trackingType: 'duration',
            target: {
              sets: draft.sets,
              durationSeconds: draft.durationSeconds,
              restSeconds: draft.restSeconds,
            },
          },
    );
  }
  return { exercises, unavailable };
}
export const optionalDayId = (id: string, weekday: Weekday) => `optional:${id}:${weekday}`;
