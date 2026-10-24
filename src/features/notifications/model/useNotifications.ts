import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsApi } from '../api/notificationsApi';

import { QUERY_KEYS } from '@/shared/config/constants';

/** Polls once a minute: there is no push channel yet, and a late notification never changes business state. */
const REFRESH_MS = 60_000;

export function useNotifications(enabled = true) {
  return useQuery({
    enabled,
    queryKey: QUERY_KEYS.notifications(),
    queryFn: () => notificationsApi.listMine(),
    refetchInterval: REFRESH_MS,
    retry: false,
  });
}

function useNotificationMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications() }),
  });
}

export const useMarkNotificationRead = () =>
  useNotificationMutation((id: string) => notificationsApi.markRead(id));
export const useMarkAllNotificationsRead = () =>
  useNotificationMutation<void>(() => notificationsApi.markAllRead());
