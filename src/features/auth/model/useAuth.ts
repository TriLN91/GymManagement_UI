import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authApi } from '../api/authApi';

import { useAuthStore } from './useAuthStore';

import type { AuthSession, LoginPayload, RegisterPayload } from '@/entities/user';
import { tokenManager } from '@/shared/api/client';
import { QUERY_KEYS } from '@/shared/config/constants';


export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (session: AuthSession) => {
      tokenManager.setTokens(session.tokens.accessToken, session.tokens.refreshToken);
      setSession(session.user);
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (session: AuthSession) => {
      tokenManager.setTokens(session.tokens.accessToken, session.tokens.refreshToken);
      setSession(session.user);
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clear();
      queryClient.clear();
    },
  });
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: QUERY_KEYS.currentUser(),
    queryFn: () => authApi.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}