import { http, HttpResponse } from 'msw';

import { emailTaken, gymAdminRegistry, trainerRegistry } from './mockRegistry';

import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors the Gym Admin endpoints of GymOwnerController: own gyms and the trainer accounts they create.
const path = (p: string) => `*${p}`;

const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });

const fail = (status: number, errorCode: string, message: string) =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode }, { status });

interface OwnedGym {
  id: string;
  name: string;
  approvalStatus: 'Approved' | 'PendingReview';
}

/** The mock access token is `mock-access-<userId>`; the user id identifies the Gym Admin. */
function ownedGyms(request: Request): OwnedGym[] {
  const userId = request.headers.get('authorization')?.replace('Bearer mock-access-', '');
  return gymAdminRegistry
    .filter((item) => item.userId === userId && item.status === 'Active')
    .map((item) => ({ id: item.gymId, name: item.gymName, approvalStatus: 'Approved' }));
}

const trainerView = (item: (typeof trainerRegistry)[number]) => ({
  userId: item.userId,
  trainerProfileId: item.trainerProfileId,
  email: item.email,
  fullName: item.fullName,
  phoneNumber: item.phoneNumber,
  gymId: item.gymId,
  gymName: item.gymName,
  status: 'Active',
  yearsOfExperience: item.yearsOfExperience,
  hourlyRate: item.hourlyRate,
});

export const gymOwnerHandlers = [
  http.get(path(ENDPOINTS.gymOwner.myGyms), ({ request }) => ok(ownedGyms(request))),

  http.get(path(ENDPOINTS.gymOwner.trainers), ({ request }) => {
    const gymIds = new Set(ownedGyms(request).map((gym) => gym.id));
    const wanted = new URL(request.url).searchParams.get('gymId');
    if (wanted && !gymIds.has(wanted)) return fail(403, 'Forbidden', '403: Không có quyền.');
    return ok(
      trainerRegistry
        .filter((item) => gymIds.has(item.gymId) && (!wanted || item.gymId === wanted))
        .map(trainerView),
    );
  }),

  http.post(path(ENDPOINTS.gymOwner.trainers), async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      phoneNumber?: string;
      yearsOfExperience?: number;
      hourlyRate?: number;
      gymId?: string;
    };
    const gyms = ownedGyms(request);
    const gym = body.gymId ? gyms.find((item) => item.id === body.gymId) : gyms[0];
    if (body.gymId && !gym) return fail(403, 'Forbidden', '403: Không có quyền.');
    if (!gym) {
      return fail(400, 'Validation', '400: Bạn chưa có phòng gym nào để thêm huấn luyện viên.');
    }
    if (gyms.length > 1 && !body.gymId) {
      return fail(400, 'Validation', '400: Bạn có nhiều phòng gym; hãy chỉ định gymId.');
    }
    const email = (body.email ?? '').trim().toLowerCase();
    if (emailTaken(email)) return fail(409, 'Conflict', '409: Email đã được đăng ký.');
    if ((body.password ?? '').length < 6) {
      return fail(400, 'Validation', '400: Mật khẩu phải có ít nhất 6 ký tự.');
    }
    const trainer = {
      userId: crypto.randomUUID(),
      trainerProfileId: crypto.randomUUID(),
      email,
      password: body.password ?? '',
      fullName: (body.fullName ?? '').trim(),
      phoneNumber: body.phoneNumber?.trim() || null,
      gymId: gym.id,
      gymName: gym.name,
      yearsOfExperience: body.yearsOfExperience ?? 0,
      hourlyRate: body.hourlyRate ?? null,
    };
    trainerRegistry.push(trainer);
    return ok(trainerView(trainer));
  }),
];
