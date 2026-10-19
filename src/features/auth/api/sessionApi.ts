import { mapAuthResponse } from './mappers';
import type { AuthResponseDto } from './types';

import type { AuthSession, LoginPayload, RegisterPayload } from '@/entities/user';
import { apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const sessionApi = {
  login: async (payload: LoginPayload): Promise<AuthSession> =>
    mapAuthResponse(await apiPost<AuthResponseDto, LoginPayload>(ENDPOINTS.auth.login, payload)),

  register: async (payload: RegisterPayload): Promise<AuthSession> =>
    mapAuthResponse(
      await apiPost<AuthResponseDto, RegisterPayload>(ENDPOINTS.auth.register, payload),
    ),

  logout: (refreshToken: string) => apiPost<void>(ENDPOINTS.auth.logout, { refreshToken }),
};
