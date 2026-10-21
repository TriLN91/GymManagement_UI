import type { CreateTrainerBody, OwnerGymDto, TrainerAccountDto } from './types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const trainersApi = {
  listMyGyms: () => apiGet<OwnerGymDto[]>(ENDPOINTS.gymOwner.myGyms),

  listTrainers: (gymId?: string) =>
    apiGet<TrainerAccountDto[]>(ENDPOINTS.gymOwner.trainerAccounts, {
      params: gymId ? { gymId } : undefined,
    }),

  createTrainer: (body: CreateTrainerBody) =>
    apiPost<TrainerAccountDto, CreateTrainerBody>(ENDPOINTS.gymOwner.trainerAccounts, body),
};
