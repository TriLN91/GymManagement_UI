import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { marketplaceReviewApi } from '../api/marketplaceReviewApi';

import { QUERY_KEYS } from '@/shared/config/constants';

export function useBranchesToReview() {
  return useQuery({
    queryKey: [...QUERY_KEYS.marketplaceReview(), 'branches'],
    queryFn: marketplaceReviewApi.listBranches,
  });
}

export function useOffersToReview() {
  return useQuery({
    queryKey: [...QUERY_KEYS.marketplaceReview(), 'offers'],
    queryFn: marketplaceReviewApi.listOffers,
  });
}

interface Decision {
  id: string;
  approve: boolean;
  reason?: string;
}

export function useDecideBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: Decision) =>
      marketplaceReviewApi.decideBranch(v.id, v.approve, { reason: v.reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketplaceReview() }),
  });
}

export function useDecideOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: Decision) =>
      marketplaceReviewApi.decideOffer(v.id, v.approve, { reason: v.reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.marketplaceReview() }),
  });
}
