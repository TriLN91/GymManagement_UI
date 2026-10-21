import { http, HttpResponse } from 'msw';

import { findRegistration, gymAdminRegistry, type MockGymAdminRegistration } from './mockRegistry';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors AdminRegistrationsController (Platform Admin review of Gym Admin registrations).
const path = (p: string) => `*${p}`;

const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });

const fail = (status: number, errorCode: string, message: string) =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode }, { status });

const view = (item: MockGymAdminRegistration) => ({
  userId: item.userId,
  email: item.email,
  fullName: item.fullName,
  phoneNumber: item.phoneNumber,
  status: item.status,
  gymId: item.gymId,
  gymName: item.gymName,
  legalName: item.legalName,
  taxCode: item.taxCode,
  createdAtUtc: item.createdAtUtc,
});

const userIdOf = (params: Record<string, string | readonly string[] | undefined>) =>
  String(params.userId ?? '');

const NOT_FOUND = '404: Không tìm thấy dữ liệu.';
const NOT_PENDING = '409: Đăng ký này không còn ở trạng thái chờ duyệt.';

export const adminRegistrationHandlers = [
  http.get(path(ENDPOINTS.adminRegistrations.gymAdmins), ({ request }) => {
    const status = new URL(request.url).searchParams.get('status') ?? 'PendingApproval';
    return ok(gymAdminRegistry.filter((item) => item.status === status).map(view));
  }),

  http.get(path('/admin/registrations/gym-admins/:userId'), ({ params }) => {
    const item = findRegistration(userIdOf(params));
    return item ? ok(view(item)) : fail(404, 'NotFound', NOT_FOUND);
  }),

  http.post(path('/admin/registrations/gym-admins/:userId/approve'), ({ params }) => {
    const item = findRegistration(userIdOf(params));
    if (!item) return fail(404, 'NotFound', NOT_FOUND);
    if (item.status !== 'PendingApproval') return fail(409, 'Conflict', NOT_PENDING);
    item.status = 'Active';
    return ok(view(item));
  }),

  http.post(path('/admin/registrations/gym-admins/:userId/reject'), async ({ params, request }) => {
    const item = findRegistration(userIdOf(params));
    if (!item) return fail(404, 'NotFound', NOT_FOUND);
    const body = (await request.json()) as { reason?: string };
    if (!body.reason?.trim()) {
      return fail(400, 'Validation', '400: Cần nêu lý do khi từ chối đăng ký.');
    }
    if (item.status !== 'PendingApproval') return fail(409, 'Conflict', NOT_PENDING);
    item.status = 'Rejected';
    item.rejectionReason = body.reason;
    return ok(view(item));
  }),
];
