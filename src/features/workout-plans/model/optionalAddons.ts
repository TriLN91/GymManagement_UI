import {
  memberExerciseCatalog,
  type BuilderExercise,
  type ExerciseCatalogItem,
  type OptionalExerciseLayer,
  type Weekday,
} from '@/features/member-workout-builder/model/useMemberWorkoutBuilderStore';

export interface OptionalDayExercise {
  addon: OptionalExerciseLayer;
  exercise: BuilderExercise;
  item: ExerciseCatalogItem;
}

/**
 * Optional exercises the Member added in the Builder for one weekday. They are shown next to the
 * scheduled day but are never part of the AI/PT plan: they are not sent to the server and not counted
 * towards the day's completion or the streak.
 */
export function optionalExercisesFor(
  addons: ReadonlyArray<OptionalExerciseLayer>,
  weekday: string,
): OptionalDayExercise[] {
  return addons.flatMap((addon) =>
    addon.exercises
      .filter((exercise) => exercise.days.includes(weekday as Weekday))
      .flatMap((exercise) => {
        const item = memberExerciseCatalog.find(
          (candidate) => candidate.id === exercise.exerciseId,
        );
        return item ? [{ addon, exercise, item }] : [];
      }),
  );
}

export function optionalTargetLabel(exercise: BuilderExercise, item: ExerciseCatalogItem) {
  if (item.trackingType === 'strength')
    return `${exercise.sets} × ${exercise.reps} @ ${exercise.loadKg} kg`;
  if (item.trackingType === 'duration') return `${exercise.sets} × ${exercise.durationSeconds} sec`;
  if (item.trackingType === 'distance') return `${exercise.distanceKm} km`;
  return `${exercise.rounds} rounds · ${exercise.workSeconds}s / ${exercise.restSeconds}s`;
}
