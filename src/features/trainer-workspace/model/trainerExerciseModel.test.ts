import { describe, expect, it } from 'vitest';

import { EMPTY_TRAINER_EXERCISE_FILTERS, filterTrainerExercises } from './trainerExerciseModel';
import { trainerExercises } from './useTrainerWorkspaceStore';

describe('trainer exercise filters', () => {
  it('uses OR inside one filter group', () => {
    const results = filterTrainerExercises(trainerExercises, '', {
      ...EMPTY_TRAINER_EXERCISE_FILTERS,
      equipment: ['Cable', 'Bike'],
    });

    expect(results.map((exercise) => exercise.id)).toEqual(['pulldown', 'row', 'bike']);
  });

  it('uses AND between filter groups', () => {
    const results = filterTrainerExercises(trainerExercises, '', {
      ...EMPTY_TRAINER_EXERCISE_FILTERS,
      equipment: ['Barbell', 'Cable'],
      difficulty: ['Beginner'],
      muscle: ['Back'],
      goal: ['Strength'],
    });

    expect(results.map((exercise) => exercise.id)).toEqual(['pulldown', 'row']);
  });

  it('combines search and selected filters', () => {
    const results = filterTrainerExercises(trainerExercises, 'sprint', {
      ...EMPTY_TRAINER_EXERCISE_FILTERS,
      muscle: ['Cardio'],
      goal: ['Conditioning'],
    });

    expect(results.map((exercise) => exercise.id)).toEqual(['bike']);
  });
});
