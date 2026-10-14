import type { TrainerExercise } from './useTrainerWorkspaceStore';

export type TrainerExerciseFilterKey = 'equipment' | 'difficulty' | 'muscle' | 'goal';
export type TrainerExerciseFilters = Record<TrainerExerciseFilterKey, string[]>;

export const EMPTY_TRAINER_EXERCISE_FILTERS: TrainerExerciseFilters = {
  equipment: [],
  difficulty: [],
  muscle: [],
  goal: [],
};

export function getExerciseGoal(exercise: TrainerExercise) {
  const goals = {
    strength: 'Strength',
    duration: 'Stability',
    distance: 'Endurance',
    interval: 'Conditioning',
  } as const;
  return goals[exercise.trackingType];
}

export function filterTrainerExercises(
  exercises: TrainerExercise[],
  query: string,
  filters: TrainerExerciseFilters,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return exercises.filter((exercise) => {
    const searchable =
      `${exercise.name} ${exercise.muscle} ${exercise.equipment} ${exercise.difficulty} ${getExerciseGoal(exercise)}`.toLocaleLowerCase();
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesEquipment =
      filters.equipment.length === 0 || filters.equipment.includes(exercise.equipment);
    const matchesDifficulty =
      filters.difficulty.length === 0 || filters.difficulty.includes(exercise.difficulty);
    const muscles = [exercise.muscle, ...(exercise.secondaryMuscles ?? [])];
    const matchesMuscle =
      filters.muscle.length === 0 || filters.muscle.some((muscle) => muscles.includes(muscle));
    const matchesGoal =
      filters.goal.length === 0 || filters.goal.includes(getExerciseGoal(exercise));
    return matchesQuery && matchesEquipment && matchesDifficulty && matchesMuscle && matchesGoal;
  });
}

export function toggleTrainerExerciseFilter(
  filters: TrainerExerciseFilters,
  key: TrainerExerciseFilterKey,
  value: string,
) {
  const values = filters[key];
  return {
    ...filters,
    [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
  };
}
