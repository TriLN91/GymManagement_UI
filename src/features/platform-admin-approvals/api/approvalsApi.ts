import type {
  GymAdminRegistrationDto,
  RegistrationDecisionBody,
  RegistrationStatusDto,
} from './types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const approvalsApi = {
  listGymAdmins: (status: RegistrationStatusDto) =>
    apiGet<GymAdminRegistrationDto[]>(ENDPOINTS.adminRegistrations.gymAdmins, {
      params: { status },
    }),

  getGymAdmin: (userId: string) =>
    apiGet<GymAdminRegistrationDto>(ENDPOINTS.adminRegistrations.gymAdmin(userId)),

  approveGymAdmin: (userId: string, reason?: string) =>
    apiPost<GymAdminRegistrationDto, RegistrationDecisionBody>(
      ENDPOINTS.adminRegistrations.approve(userId),
      { reason },
    ),

  // The backend requires a reason when rejecting.
  rejectGymAdmin: (userId: string, reason: string) =>
    apiPost<GymAdminRegistrationDto, RegistrationDecisionBody>(
      ENDPOINTS.adminRegistrations.reject(userId),
      { reason },
    ),
};
