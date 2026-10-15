import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { trainersApi } from '../api/trainersApi';
import type { CreateTrainerBody } from '../api/types';

import { QUERY_KEYS } from '@/shared/config/constants';

/** Gyms (organizations) owned by the signed-in Gym Admin. */
export function useMyGyms(enabled = true) {
  return useQuery({
    enabled,
    queryKey: QUERY_KEYS.ownerGyms(),
    queryFn: trainersApi.listMyGyms,
    staleTime: 60_000,
    retry: false,
  });
}

/** Trainer accounts that belong to the Gym Admin's gyms. */
export function useOwnerTrainers(gymId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ownerTrainers(gymId),
    queryFn: () => trainersApi.listTrainers(gymId),
  });
}

export function useCreateOwnerTrainer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTrainerBody) => trainersApi.createTrainer(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gym-owner', 'trainers'] }),
  });
}
