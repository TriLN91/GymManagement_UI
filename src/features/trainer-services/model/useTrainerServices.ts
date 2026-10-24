import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { trainerServicesApi } from '../api/trainerServicesApi';
import type { CreateTrainerServiceBody } from '../api/types';

import { QUERY_KEYS } from '@/shared/config/constants';

export function useTrainerServices(trainerProfileId: string) {
  return useQuery({
    enabled: trainerProfileId !== '',
    queryKey: QUERY_KEYS.trainerServices(trainerProfileId),
    queryFn: () => trainerServicesApi.list(trainerProfileId),
  });
}

export function useCreateTrainerService(trainerProfileId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTrainerServiceBody) =>
      trainerServicesApi.create(trainerProfileId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trainerServices(trainerProfileId) }),
  });
}

export function useSetTrainerServiceActive(trainerProfileId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { serviceId: string; active: boolean }) =>
      trainerServicesApi.setActive(v.serviceId, v.active),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trainerServices(trainerProfileId) }),
  });
}
