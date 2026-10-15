import type { AssignmentDto, MemberProfileDto } from './types';

import { apiGet } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const assignmentsApi = {
  /** Coaching assignments of the signed-in user (a Trainer sees the Members assigned to them). */
  listMine: () => apiGet<AssignmentDto[]>(ENDPOINTS.coaching.me.assignments),

  /** Fitness profile of an assigned Member; the backend requires an active assignment with read access. */
  getMemberProfile: (memberProfileId: string) =>
    apiGet<MemberProfileDto>(ENDPOINTS.coaching.memberProfile(memberProfileId)),
};
