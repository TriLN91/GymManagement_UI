import type { OwnerGymDto, TrainerAccountDto } from './types';

import { apiGet } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const trainersApi = {
  listMyGyms: () => apiGet<OwnerGymDto[]>(ENDPOINTS.gymOwner.myGyms),

  listTrainers: (gymId?: string) =>
    apiGet<TrainerAccountDto[]>(ENDPOINTS.gymOwner.trainers, {
      params: gymId ? { gymId } : undefined,
    }),
};
