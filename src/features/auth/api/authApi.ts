import { mapAuthResponse, type AuthResponseDto } from './mappers';

import type { AuthSession, LoginPayload, RegisterPayload } from '@/entities/user';
import { apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthSession> =>
    mapAuthResponse(await apiPost<AuthResponseDto, LoginPayload>(ENDPOINTS.auth.login, payload)),

  register: async (payload: RegisterPayload): Promise<AuthSession> =>
    mapAuthResponse(
      await apiPost<AuthResponseDto, RegisterPayload>(ENDPOINTS.auth.register, payload),
    ),

  logout: (refreshToken: string) => apiPost<void>(ENDPOINTS.auth.logout, { refreshToken }),

  // Not implemented by the backend yet (see PLAN Phase 4); only served by MSW.
  forgotPassword: (email: string) => apiPost<void>(ENDPOINTS.auth.forgotPassword, { email }),

  resetPassword: (token: string, password: string) =>
    apiPost<void>(ENDPOINTS.auth.resetPassword, { token, password }),
};
