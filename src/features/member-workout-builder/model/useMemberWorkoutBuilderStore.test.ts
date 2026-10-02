import { beforeEach, describe, expect, it } from 'vitest';

import {
  memberExerciseCatalog,
  useMemberWorkoutBuilderStore,
} from './useMemberWorkoutBuilderStore';

const benchPress = memberExerciseCatalog.find((exercise) => exercise.id === 'barbell-bench-press');

describe('member workout builder schedule', () => {
  beforeEach(() => {
    useMemberWorkoutBuilderStore.setState({
      name: '',
      exercises: [],
      savedPlans: [],
      optionalAddons: [],
    });
  });

  it('rejects duplicate exercise and weekday combinations', () => {
    if (!benchPress) throw new Error('Expected bench press catalog exercise');
    const store = useMemberWorkoutBuilderStore.getState();
    store.setName('Upper body');
    store.addExercise(benchPress);
    store.addExercise(benchPress);
    const [first, second] = useMemberWorkoutBuilderStore.getState().exercises;
    if (!first || !second) throw new Error('Expected two builder exercises');
    useMemberWorkoutBuilderStore.getState().updateExercise(first.uid, { days: ['monday'] });
    useMemberWorkoutBuilderStore.getState().updateExercise(second.uid, { days: ['monday'] });

    expect(useMemberWorkoutBuilderStore.getState().savePlan('new_plan')).toBeNull();
  });

  it('saves one exercise on multiple weekdays', () => {
    if (!benchPress) throw new Error('Expected bench press catalog exercise');
    const store = useMemberWorkoutBuilderStore.getState();
    store.setName('Three-day chest plan');
    store.addExercise(benchPress);
    const exercise = useMemberWorkoutBuilderStore.getState().exercises[0];
    if (!exercise) throw new Error('Expected one builder exercise');
    useMemberWorkoutBuilderStore.getState().updateExercise(exercise.uid, {
      days: ['monday', 'wednesday', 'friday'],
    });

    const result = useMemberWorkoutBuilderStore.getState().savePlan('new_plan');

    expect(result?.exercises[0]?.days).toEqual(['monday', 'wednesday', 'friday']);
  });

  it('requires every exercise to have at least one weekday', () => {
    if (!benchPress) throw new Error('Expected bench press catalog exercise');
    const store = useMemberWorkoutBuilderStore.getState();
    store.setName('Unscheduled plan');
    store.addExercise(benchPress);

    expect(useMemberWorkoutBuilderStore.getState().savePlan('new_plan')).toBeNull();
  });

  it('creates an optional exercise layer without altering the AI/PT plan', () => {
    if (!benchPress) throw new Error('Expected bench press catalog exercise');
    const store = useMemberWorkoutBuilderStore.getState();
    store.setName('Add chest press');
    store.addExercise(benchPress);
    const exercise = useMemberWorkoutBuilderStore.getState().exercises[0];
    if (!exercise) throw new Error('Expected one builder exercise');
    useMemberWorkoutBuilderStore.getState().updateExercise(exercise.uid, { days: ['thursday'] });

    const result = useMemberWorkoutBuilderStore.getState().savePlan('optional_addon');

    expect(result).toMatchObject({
      status: 'active',
      sourcePlanName: 'AI/PT Active Plan',
      affectsPlanCompletion: false,
    });
    expect(useMemberWorkoutBuilderStore.getState().savedPlans).toHaveLength(0);
    expect(useMemberWorkoutBuilderStore.getState().optionalAddons).toHaveLength(1);
  });
});
