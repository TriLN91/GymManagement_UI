import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { approvalsApi } from '../api/approvalsApi';
import { toApprovalRecord } from '../api/mappers';

import type { PlatformApprovalRecord } from './types';

import { QUERY_KEYS } from '@/shared/config/constants';

/** Pending Gym Admin registrations, as approval records. */
export function usePendingGymApplications(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.gymAdminRegistrations('PendingApproval'),
    queryFn: async () =>
      (await approvalsApi.listGymAdmins('PendingApproval')).map(toApprovalRecord),
    enabled,
  });
}

export function useGymApplication(userId: string | undefined, enabled = true) {
  return useQuery<PlatformApprovalRecord>({
    queryKey: QUERY_KEYS.gymAdminRegistration(userId ?? ''),
    queryFn: async () => toApprovalRecord(await approvalsApi.getGymAdmin(userId ?? '')),
    enabled: enabled && Boolean(userId),
  });
}

function useRefreshGymApplications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
}

export function useApproveGymApplication() {
  const refresh = useRefreshGymApplications();
  return useMutation({
    mutationFn: (userId: string) => approvalsApi.approveGymAdmin(userId),
    onSuccess: refresh,
  });
}

export function useRejectGymApplication() {
  const refresh = useRefreshGymApplications();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      approvalsApi.rejectGymAdmin(userId, reason),
    onSuccess: refresh,
  });
}
