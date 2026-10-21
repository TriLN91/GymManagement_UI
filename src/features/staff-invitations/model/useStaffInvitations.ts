import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { staffInvitationsApi } from '../api/staffInvitationsApi';
import type { CreateInvitationBody } from '../api/types';

import { marketplaceApi } from '@/features/marketplace';
import { QUERY_KEYS } from '@/shared/config/constants';

export function useStaffInvitations() {
  return useQuery({ queryKey: QUERY_KEYS.staffInvitations(), queryFn: staffInvitationsApi.list });
}

/** Branches of the Gym Admin's first brand, for the "invite to" picker. */
export function useInvitableBranches() {
  return useQuery({
    queryKey: [...QUERY_KEYS.staffInvitations(), 'branches'],
    queryFn: async () => {
      const brands = await marketplaceApi.getMyBrands();
      const brand = brands[0];
      return brand ? marketplaceApi.getBrandBranches(brand.id) : [];
    },
    retry: false,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateInvitationBody) => staffInvitationsApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffInvitations() }),
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffInvitationsApi.revoke(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staffInvitations() }),
  });
}

export function useInvitationPreview(token: string) {
  return useQuery({
    enabled: token !== '',
    queryKey: [...QUERY_KEYS.staffInvitations(), 'preview', token],
    queryFn: () => staffInvitationsApi.preview(token),
    retry: false,
  });
}

export function useAcceptInvitation() {
  return useMutation({ mutationFn: staffInvitationsApi.accept });
}
