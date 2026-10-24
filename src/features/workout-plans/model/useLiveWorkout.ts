import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { ExerciseView, SessionCorrectionBody } from '../api/types';
import { workoutApi } from '../api/workoutApi';

import { activeVersion, buildWorkoutWeek } from './liveWorkout';

import { useProgressionState } from '@/features/gamification/model/useProgression';
import { QUERY_KEYS } from '@/shared/config/constants';

export function useWorkoutPlans() {
  return useQuery({ queryKey: QUERY_KEYS.workoutPlans(), queryFn: workoutApi.getPlans });
}

export function useCorrectSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { sessionId: string; body: SessionCorrectionBody }) =>
      workoutApi.correctSession(v.sessionId, v.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workoutSessions() }),
  });
}

export function useExerciseCatalog() {
  const query = useQuery({
    queryKey: QUERY_KEYS.workoutExercises(),
    queryFn: workoutApi.getExercises,
    staleTime: 5 * 60_000,
  });
  const catalog = useMemo(
    () => new Map<string, ExerciseView>((query.data ?? []).map((item) => [item.id, item])),
    [query.data],
  );
  return { ...query, catalog };
}

export function useWorkoutSessions() {
  return useQuery({
    queryKey: QUERY_KEYS.workoutSessions(),
    queryFn: () => workoutApi.getSessions(1, 50),
  });
}

/** Current UTC+7 week built from server data only: CF05 schedule days, the Member's plans and the catalog. */
export function useLiveWorkoutWeek() {
  const state = useProgressionState();
  const plans = useWorkoutPlans();
  const exercises = useExerciseCatalog();
  const week = useMemo(
    () =>
      state.data && exercises.data
        ? buildWorkoutWeek(state.data.days, state.data.businessDate, plans.data, exercises.catalog)
        : [],
    [state.data, plans.data, exercises.data, exercises.catalog],
  );
  return {
    week,
    businessDate: state.data?.businessDate ?? null,
    scheduleConfigured: state.data?.streak.scheduleConfigured ?? false,
    hasActivePlan: Boolean(activeVersion(plans.data)),
    catalog: exercises.catalog,
    exercises: exercises.data ?? [],
    isPending: state.isPending || plans.isPending || exercises.isPending,
    isError: state.isError || plans.isError || exercises.isError,
    refetch: () => Promise.all([state.refetch(), plans.refetch(), exercises.refetch()]),
  };
}
