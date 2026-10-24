import type {
  AcceptInvitationBody,
  CreateInvitationBody,
  StaffInvitationDto,
  StaffInvitationPreviewDto,
} from './types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const E = ENDPOINTS.staffInvitations;

export const staffInvitationsApi = {
  list: () => apiGet<StaffInvitationDto[]>(E.list),
  create: (body: CreateInvitationBody) => apiPost<StaffInvitationDto>(E.list, body),
  revoke: (id: string) => apiPost<boolean>(E.revoke(id)),
  preview: (token: string) => apiGet<StaffInvitationPreviewDto>(E.preview, { params: { token } }),
  accept: (body: AcceptInvitationBody) => apiPost<boolean>(E.accept, body),
};
