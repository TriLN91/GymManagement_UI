import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { coachingApi } from '../api/coachingApi';

import type { CheckInPayload } from '@/entities/plan';
import { QUERY_KEYS } from '@/shared/config/constants';

export function useCurrentPlan() {
  return useQuery({
    queryKey: QUERY_KEYS.currentPlan(),
    queryFn: () => coachingApi.getCurrentPlan(),
    staleTime: 60_000,
  });
}

// FR-AIC-04: adaptive plan after check-in — invalidate so next render refetches.
export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckInPayload) => coachingApi.submitCheckIn(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentPlan() });
    },
  });
}
