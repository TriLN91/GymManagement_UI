import type { CreateTrainerServiceBody, TrainerServiceDto } from './types';

import { apiGet, apiPost, apiPut } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const E = ENDPOINTS.trainerServices;

export const trainerServicesApi = {
  list: (trainerProfileId: string) => apiGet<TrainerServiceDto[]>(E.forTrainer(trainerProfileId)),
  create: (trainerProfileId: string, body: CreateTrainerServiceBody) =>
    apiPost<TrainerServiceDto>(E.forTrainer(trainerProfileId), body),
  setActive: (serviceId: string, active: boolean) =>
    apiPut<TrainerServiceDto>(E.active(serviceId), undefined, { params: { active } }),
};
