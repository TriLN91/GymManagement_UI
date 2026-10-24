import { http, HttpResponse } from 'msw';

import type { StaffInvitationDto } from '@/features/staff-invitations/api/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors the backend invitation flow in memory (reset on reload): one open invitation per e-mail, token = the invitation id.
const path = (p: string) => `*${p}`;
const E = ENDPOINTS.staffInvitations;
const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });
const fail = (status: number, message: string, errorCode = 'Domain') =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode }, { status });

const invitations: StaffInvitationDto[] = [];
let sequence = 0;

export const staffInvitationHandlers = [
  http.get(path(E.list), () => ok([...invitations].reverse())),

  http.post(path(E.list), async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      role: StaffInvitationDto['role'];
      gymBranchId: string;
      fullName?: string;
    };
    const email = body.email.trim().toLowerCase();
    invitations.forEach((i) => {
      if (i.email === email && i.status === 'Pending') i.status = 'Revoked';
    });
    const created: StaffInvitationDto = {
      id: `invite-${++sequence}`,
      gymBranchId: body.gymBranchId,
      branchName: 'Fit Central District 1',
      email,
      role: body.role,
      fullName: body.fullName ?? null,
      expiresAtUtc: new Date(Date.now() + 7 * 24 * 3_600_000).toISOString(),
      status: 'Pending',
      createdAtUtc: new Date().toISOString(),
      debugAcceptUrl: `${window.location.origin}/accept-invitation?token=invite-${sequence}`,
    };
    invitations.push(created);
    return ok(created);
  }),

  http.post(path('/gym-owner/invitations/:id/revoke'), ({ params }) => {
    const found = invitations.find((i) => i.id === params.id);
    if (!found || found.status !== 'Pending')
      return fail(409, 'Lời mời không còn ở trạng thái chờ.');
    found.status = 'Revoked';
    return ok(true);
  }),

  http.get(path(E.preview), ({ request }) => {
    const token = new URL(request.url).searchParams.get('token');
    const found = invitations.find((i) => i.id === token && i.status === 'Pending');
    if (!found) return fail(404, '404: Không tìm thấy', 'NotFound');
    return ok({
      email: found.email,
      role: found.role,
      fullName: found.fullName,
      gymName: 'Fit Central',
      branchName: found.branchName,
      expiresAtUtc: found.expiresAtUtc,
    });
  }),

  http.post(path(E.accept), async ({ request }) => {
    const body = (await request.json()) as { token: string };
    const found = invitations.find((i) => i.id === body.token && i.status === 'Pending');
    if (!found) return fail(404, '404: Không tìm thấy', 'NotFound');
    found.status = 'Accepted';
    return ok(true);
  }),
];
