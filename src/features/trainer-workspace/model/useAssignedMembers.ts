import { useQuery } from '@tanstack/react-query';

import { assignmentsApi } from '../api/assignmentsApi';

import { QUERY_KEYS } from '@/shared/config/constants';

/** Coaching assignments of the signed-in user. */
export function useMyAssignments() {
  return useQuery({
    queryKey: QUERY_KEYS.myAssignments(),
    queryFn: assignmentsApi.listMine,
  });
}

/** Fitness profile of one assigned Member; fetched only when the Trainer opens it. */
export function useAssignedMemberProfile(memberProfileId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.assignedMemberProfile(memberProfileId),
    queryFn: () => assignmentsApi.getMemberProfile(memberProfileId),
    enabled,
  });
}
