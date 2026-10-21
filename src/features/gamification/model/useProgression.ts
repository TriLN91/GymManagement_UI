import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { progressionApi } from '../api/progressionApi';
import type { RecoveryInput } from '../api/types';

import { QUERY_KEYS } from '@/shared/config/constants';

// Progression values come only from the backend (single state version for every surface, UC26).
export function useProgressionState() {
  return useQuery({
    queryKey: QUERY_KEYS.progressionState(),
    queryFn: progressionApi.getState,
    retry: false,
  });
}

export function useProgressionHistory() {
  return useQuery({
    queryKey: QUERY_KEYS.progressionHistory(),
    queryFn: () => progressionApi.getHistory(),
  });
}

export function useTrainingSchedule() {
  return useQuery({
    queryKey: QUERY_KEYS.progressionSchedule(),
    queryFn: progressionApi.getSchedule,
  });
}

export function useRecoveryReports() {
  return useQuery({
    queryKey: QUERY_KEYS.progressionRecovery(),
    queryFn: progressionApi.getRecovery,
  });
}

function useInvalidateProgression() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['progression'] });
}

export function useSetSchedule() {
  const invalidate = useInvalidateProgression();
  return useMutation({
    mutationFn: (days: number[]) => progressionApi.setSchedule(days),
    onSuccess: invalidate,
  });
}

export function useMarkBadgeSeen() {
  const invalidate = useInvalidateProgression();
  return useMutation({
    mutationFn: (awardId: string) => progressionApi.markBadgeSeen(awardId),
    onSuccess: invalidate,
  });
}

export function useSetPrimaryDistanceSource() {
  const invalidate = useInvalidateProgression();
  return useMutation({
    mutationFn: (provider: string | null) => progressionApi.setPrimaryDistanceSource(provider),
    onSuccess: invalidate,
  });
}

export function useReportRecovery() {
  const invalidate = useInvalidateProgression();
  return useMutation({
    mutationFn: (input: RecoveryInput) => progressionApi.reportRecovery(input),
    onSuccess: invalidate,
  });
}

export function usePauseTraining() {
  const invalidate = useInvalidateProgression();
  return useMutation({
    mutationFn: ({ reportId, reason }: { reportId: string | null; reason: string | null }) =>
      progressionApi.pause(reportId, reason),
    onSuccess: invalidate,
  });
}

export function useResumeTraining() {
  const invalidate = useInvalidateProgression();
  return useMutation({ mutationFn: () => progressionApi.resume(), onSuccess: invalidate });
}
