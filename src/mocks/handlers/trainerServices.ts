import { http, HttpResponse } from 'msw';

import type { TrainerServiceDto } from '@/features/trainer-services/api/types';

// In-memory Trainer services (reset on reload).
const path = (p: string) => `*${p}`;
const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });
const fail = (status: number, message: string) =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode: 'Domain' }, { status });

const services: TrainerServiceDto[] = [];
let sequence = 0;

export const trainerServiceHandlers = [
  http.get(path('/gym-owner/trainers/:trainerProfileId/services'), ({ params }) =>
    ok(services.filter((s) => s.trainerProfileId === params.trainerProfileId)),
  ),

  http.post(path('/gym-owner/trainers/:trainerProfileId/services'), async ({ params, request }) => {
    const body = (await request.json()) as {
      name: string;
      description?: string;
      durationMinutes: number;
      price: number;
    };
    if (!body.name.trim()) return fail(400, 'Tên dịch vụ là bắt buộc.');
    if (body.durationMinutes < 15 || body.durationMinutes > 480)
      return fail(400, 'Thời lượng phải từ 15 đến 480 phút.');
    const created: TrainerServiceDto = {
      id: `service-${++sequence}`,
      trainerProfileId: String(params.trainerProfileId),
      gymId: 'brand-main',
      name: body.name.trim(),
      description: body.description ?? null,
      durationMinutes: body.durationMinutes,
      price: body.price,
      currencyCode: 'VND',
      isActive: true,
    };
    services.push(created);
    return ok(created);
  }),

  http.put(path('/gym-owner/trainer-services/:serviceId/active'), ({ params, request }) => {
    const found = services.find((s) => s.id === params.serviceId);
    if (!found) return fail(404, '404: Không tìm thấy');
    found.isActive = new URL(request.url).searchParams.get('active') === 'true';
    return ok(found);
  }),
];
