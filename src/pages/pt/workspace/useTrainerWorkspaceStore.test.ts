import { beforeEach, describe, expect, it } from 'vitest';

import { trainerMembers, useTrainerWorkspaceStore } from './useTrainerWorkspaceStore';

describe('trainer workspace store', () => {
  beforeEach(() => {
    localStorage.clear();
    useTrainerWorkspaceStore.persist.clearStorage();
  });

  it('saves a plan for the selected Member and updates actual execution data', () => {
    const store = useTrainerWorkspaceStore.getState();
    store.loadMemberPlan('mai');
    store.setDraftMeta({ name: 'Mai strength reset', week: 5 });
    store.addDraftExercise('bench');
    useTrainerWorkspaceStore.getState().saveDraftPlan();

    const plan = useTrainerWorkspaceStore.getState().plans.find((item) => item.memberId === 'mai');
    expect(plan).toMatchObject({ name: 'Mai strength reset', week: 5 });
    expect(plan?.exercises.some((exercise) => exercise.exerciseId === 'bench')).toBe(true);

    const exercise = plan?.exercises[0];
    expect(exercise).toBeDefined();
    useTrainerWorkspaceStore.getState().updateMemberPlanExercise('mai', exercise!.uid, {
      actualSets: 3,
      actualReps: 10,
      actualLoad: 35,
      completed: true,
    });
    expect(
      useTrainerWorkspaceStore
        .getState()
        .plans.find((item) => item.memberId === 'mai')
        ?.exercises.find((item) => item.uid === exercise!.uid),
    ).toMatchObject({ actualSets: 3, actualReps: 10, actualLoad: 35, completed: true });
  });

  it('creates and updates appointments without duplicating them', () => {
    const appointment = {
      id: 'appt-test',
      memberId: trainerMembers[0]!.id,
      type: 'Video check-in',
      date: '2026-10-02',
      time: '09:30',
      duration: 30,
      status: 'pending' as const,
      notes: 'Form review',
    };
    useTrainerWorkspaceStore.getState().saveAppointment(appointment);
    useTrainerWorkspaceStore.getState().saveAppointment({
      ...appointment,
      status: 'confirmed',
    });

    const matches = useTrainerWorkspaceStore
      .getState()
      .appointments.filter((item) => item.id === appointment.id);
    expect(matches).toHaveLength(1);
    expect(matches[0]?.status).toBe('confirmed');
  });

  it('blocks duplicate exercises on the same day and allows them on another day', () => {
    const store = useTrainerWorkspaceStore.getState();
    store.loadMemberPlan('alex');
    const before = useTrainerWorkspaceStore.getState().draftExercises;
    const mondayBenchCount = before.filter(
      (exercise) => exercise.exerciseId === 'bench' && exercise.day === 'monday',
    ).length;

    store.addDraftExercise('bench', 'monday');
    store.addDraftExercise('bench', 'tuesday');

    const after = useTrainerWorkspaceStore.getState().draftExercises;
    expect(
      after.filter((exercise) => exercise.exerciseId === 'bench' && exercise.day === 'monday'),
    ).toHaveLength(mondayBenchCount);
    expect(
      after.filter((exercise) => exercise.exerciseId === 'bench' && exercise.day === 'tuesday'),
    ).toHaveLength(1);
  });
});
