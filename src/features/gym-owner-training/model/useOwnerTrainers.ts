import { useQuery } from '@tanstack/react-query';

import { trainersApi } from '../api/trainersApi';

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

/** Trainers that belong to the Gym Admin's gyms (creation lives in the marketplace API, `createGymTrainer`). */
export function useOwnerTrainers(gymId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ownerTrainers(gymId),
    queryFn: () => trainersApi.listTrainers(gymId),
  });
}
