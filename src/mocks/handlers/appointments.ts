import { http, HttpResponse } from 'msw';

import type {
  AppointmentDto,
  AvailabilitySlotDto,
  ManagedAssignmentDto,
  SessionAssignmentDto,
  TrainerChangeDto,
} from '@/features/appointments/api/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

// Mirrors the backend CF04 rules in memory (docs/cf04/DESIGN.md): 24 h notice, quota, one confirmation per
// proposal, reschedule through a change request, Trainer change in two steps. Reset on page reload.
const path = (p: string) => `*${p}`;
const MIN_NOTICE_MS = 24 * 3_600_000;
const UTC_OFFSET_HOURS = 7;

const ok = (data: unknown) =>
  HttpResponse.json({ isSuccess: true, message: '200: OK', data }, { status: 200 });
const fail = (status: number, message: string) =>
  HttpResponse.json({ isSuccess: false, message, data: null, errorCode: 'Domain' }, { status });

type Role = 'Member' | 'Trainer' | 'Manager';
// The handler runs in the page, so the signed-in user is read from the persisted auth store (roles: member | pt | gym_admin).
const roleOf = (): Role => {
  try {
    const raw = localStorage.getItem('app:auth');
    const roles =
      (JSON.parse(raw ?? '{}') as { state?: { user?: { roles?: string[] } } }).state?.user?.roles ??
      [];
    if (roles.includes('pt')) return 'Trainer';
    if (roles.includes('gym_admin')) return 'Manager';
  } catch {
    // fall through to Member
  }
  return 'Member';
};

const TRAINERS = {
  'tp-demo': 'Paolo Trainer',
  'tp-two': 'Tran Coach',
} as Record<string, string>;
const MEMBER = { id: 'mp-demo', name: 'Maya Member' };

interface MockAssignment {
  id: string;
  trainerProfileId: string;
  totalSessions: number;
  sessionsUsed: number;
}
const assignment: MockAssignment = {
  id: 'as-demo',
  trainerProfileId: 'tp-demo',
  totalSessions: 4,
  sessionsUsed: 0,
};

let availability: AvailabilitySlotDto[] = [];
const appointments: AppointmentDto[] = [];
const trainerChanges: TrainerChangeDto[] = [];
let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${++sequence}`;

const isOpen = (a: AppointmentDto) =>
  a.status === 'Proposed' || a.status === 'Scheduled' || a.status === 'Reassigned';
const openChange = () =>
  trainerChanges.find((c) => c.status === 'PendingManager' || c.status === 'PendingMember') ?? null;

const withViewer = (a: AppointmentDto, role: Role): AppointmentDto => ({
  ...a,
  awaitingMyResponse:
    (a.status === 'Proposed' && a.proposedByRole !== role) ||
    (a.status === 'Reassigned' && role === 'Member'),
  pendingChange: a.pendingChange
    ? { ...a.pendingChange, awaitingMyResponse: a.pendingChange.requestedByRole !== role }
    : null,
});

const remaining = () =>
  assignment.totalSessions === 0
    ? null
    : Math.max(
        0,
        assignment.totalSessions -
          assignment.sessionsUsed -
          appointments.filter((a) => isOpen(a)).length,
      );

const assignmentView = (): SessionAssignmentDto => ({
  id: assignment.id,
  memberProfileId: MEMBER.id,
  memberName: MEMBER.name,
  trainerProfileId: assignment.trainerProfileId,
  trainerName: TRAINERS[assignment.trainerProfileId] ?? '',
  gymBranchId: 'br-demo',
  gymBranchName: 'Demo Branch',
  status: 'Active',
  startsAtUtc: '2026-10-01T00:00:00.000Z',
  endsAtUtc: '2026-12-31T00:00:00.000Z',
  totalSessions: assignment.totalSessions,
  sessionsUsed: assignment.sessionsUsed,
  sessionsRemaining: remaining(),
  openTrainerChange: openChange(),
});

const localParts = (iso: string) => {
  const local = new Date(new Date(iso).getTime() + UTC_OFFSET_HOURS * 3_600_000);
  return { day: local.getUTCDay(), minutes: local.getUTCHours() * 60 + local.getUTCMinutes() };
};
const toMinutes = (hhmm: string) => {
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
};
const fitsAvailability = (iso: string, duration: number) => {
  if (availability.length === 0) return true;
  const { day, minutes } = localParts(iso);
  return availability.some(
    (s) =>
      s.dayOfWeek === day &&
      minutes >= toMinutes(s.startTime) &&
      minutes + duration <= toMinutes(s.endTime),
  );
};
const overlaps = (iso: string, duration: number, ignoreId?: string) => {
  const start = new Date(iso).getTime();
  const end = start + duration * 60_000;
  return appointments.some(
    (a) =>
      a.id !== ignoreId &&
      isOpen(a) &&
      new Date(a.scheduledAtUtc).getTime() < end &&
      new Date(a.scheduledAtUtc).getTime() + a.durationMinutes * 60_000 > start,
  );
};
const insideNotice = (iso: string) => new Date(iso).getTime() - Date.now() < MIN_NOTICE_MS;

const find = (id: string) => appointments.find((a) => a.id === id);

export const appointmentHandlers = [
  http.get(path(ENDPOINTS.appointments.mine), () => {
    const role = roleOf();
    return ok(appointments.map((a) => withViewer(a, role)));
  }),

  http.get(path(ENDPOINTS.appointments.assignments), () => ok([assignmentView()])),

  http.get(path(ENDPOINTS.appointments.availability), () =>
    ok({
      trainerProfileId: assignment.trainerProfileId,
      utcOffsetHours: UTC_OFFSET_HOURS,
      slots: availability,
    }),
  ),

  http.get(path(ENDPOINTS.appointments.trainerAvailability), () =>
    ok({ trainerProfileId: 'tp-demo', utcOffsetHours: UTC_OFFSET_HOURS, slots: availability }),
  ),

  http.put(path(ENDPOINTS.appointments.trainerAvailability), async ({ request }) => {
    const body = (await request.json()) as { slots: AvailabilitySlotDto[] };
    for (const slot of body.slots) {
      if (toMinutes(slot.startTime) >= toMinutes(slot.endTime))
        return fail(400, 'Giờ bắt đầu phải trước giờ kết thúc.');
    }
    availability = body.slots.map((slot) => ({ ...slot, id: nextId('slot') }));
    return ok({
      trainerProfileId: 'tp-demo',
      utcOffsetHours: UTC_OFFSET_HOURS,
      slots: availability,
    });
  }),

  http.post(path(ENDPOINTS.appointments.create), async ({ request }) => {
    const role = roleOf();
    const body = (await request.json()) as {
      scheduledAtUtc: string;
      durationMinutes: number;
      notes?: string;
    };
    if (insideNotice(body.scheduledAtUtc))
      return fail(409, 'Buổi hẹn phải đặt trước ít nhất 24 giờ.');
    if (!fitsAvailability(body.scheduledAtUtc, body.durationMinutes))
      return fail(409, 'Giờ này nằm ngoài lịch rảnh của huấn luyện viên.');
    if (overlaps(body.scheduledAtUtc, body.durationMinutes))
      return fail(409, 'Trùng giờ với một buổi khác.');
    if (remaining() === 0) return fail(409, 'Gói đã hết số buổi.');
    const created: AppointmentDto = {
      id: nextId('appt'),
      coachingAssignmentId: assignment.id,
      gymId: 'gym-demo',
      gymBranchId: 'br-demo',
      gymBranchName: 'Demo Branch',
      memberProfileId: MEMBER.id,
      memberName: MEMBER.name,
      trainerProfileId: assignment.trainerProfileId,
      trainerName: TRAINERS[assignment.trainerProfileId] ?? '',
      originalTrainerProfileId: assignment.trainerProfileId,
      originalTrainerName: TRAINERS[assignment.trainerProfileId] ?? '',
      scheduledAtUtc: body.scheduledAtUtc,
      durationMinutes: body.durationMinutes,
      status: 'Proposed',
      notes: body.notes ?? null,
      proposedByRole: role,
      awaitingMyResponse: false,
      isReassigned: false,
      reassignmentReason: null,
      memberConsentApproved: false,
      consumedSession: false,
      cancelReason: null,
      cancelledAtUtc: null,
      completedAtUtc: null,
      pendingChange: null,
    };
    appointments.push(created);
    return ok(withViewer(created, role));
  }),

  http.post(path('/appointments/:id/accept'), ({ params }) => {
    const a = find(String(params.id));
    if (!a || a.status !== 'Proposed') return fail(409, 'Chỉ đề xuất đang chờ mới xác nhận được.');
    if (a.proposedByRole === roleOf())
      return fail(403, 'Bạn không thể tự xác nhận đề xuất của mình.');
    a.status = 'Scheduled';
    return ok(withViewer(a, roleOf()));
  }),

  http.post(path('/appointments/:id/decline'), ({ params }) => {
    const a = find(String(params.id));
    if (!a || a.status !== 'Proposed') return fail(409, 'Chỉ đề xuất đang chờ mới từ chối được.');
    a.status = 'Cancelled';
    a.cancelReason = 'Declined';
    return ok(withViewer(a, roleOf()));
  }),

  http.post(path('/appointments/:id/cancel'), async ({ params, request }) => {
    const role = roleOf();
    const a = find(String(params.id));
    const body = (await request.json()) as { reason: string; isEmergency: boolean };
    if (!a || !isOpen(a)) return fail(409, 'Buổi hẹn không còn hiệu lực.');
    const late = insideNotice(a.scheduledAtUtc);
    if (late && role === 'Trainer' && !body.isEmergency)
      return fail(409, 'Trong 24 giờ cuối chỉ huấn luyện viên báo khẩn cấp mới huỷ được.');
    a.status = 'Cancelled';
    a.cancelReason = body.reason;
    a.cancelledAtUtc = new Date().toISOString();
    a.pendingChange = null;
    // A Member who cancels inside the notice window loses the session; a Trainer never costs the Member one.
    if (late && role === 'Member') {
      a.consumedSession = true;
      assignment.sessionsUsed += 1;
    }
    return ok(withViewer(a, role));
  }),

  http.post(path('/appointments/:id/complete'), ({ params }) => {
    const a = find(String(params.id));
    if (!a || a.status !== 'Scheduled')
      return fail(409, 'Chỉ buổi đã xác nhận mới hoàn thành được.');
    if (new Date(a.scheduledAtUtc).getTime() > Date.now()) return fail(409, 'Buổi chưa bắt đầu.');
    a.status = 'Completed';
    a.completedAtUtc = new Date().toISOString();
    a.consumedSession = true;
    assignment.sessionsUsed += 1;
    return ok(withViewer(a, 'Trainer'));
  }),

  http.post(path('/appointments/:id/no-show'), ({ params }) => {
    const a = find(String(params.id));
    if (!a || a.status !== 'Scheduled') return fail(409, 'Chỉ buổi đã xác nhận mới ghi vắng được.');
    if (new Date(a.scheduledAtUtc).getTime() > Date.now()) return fail(409, 'Buổi chưa bắt đầu.');
    a.status = 'NoShow';
    a.consumedSession = true;
    assignment.sessionsUsed += 1;
    return ok(withViewer(a, 'Trainer'));
  }),

  http.post(path('/appointments/:id/reschedule'), async ({ params, request }) => {
    const role = roleOf();
    const a = find(String(params.id));
    const body = (await request.json()) as {
      newScheduledAtUtc: string;
      reason: string;
      isEmergency: boolean;
    };
    if (!a || a.status !== 'Scheduled') return fail(409, 'Chỉ buổi đã xác nhận mới dời lịch được.');
    if (a.pendingChange) return fail(409, 'Đã có một yêu cầu dời lịch đang chờ.');
    if (insideNotice(a.scheduledAtUtc) && !(role === 'Trainer' && body.isEmergency))
      return fail(409, 'Buổi hẹn nằm trong 24 giờ tới nên không dời được.');
    if (!(role === 'Trainer' && body.isEmergency) && insideNotice(body.newScheduledAtUtc))
      return fail(409, 'Giờ mới phải cách hiện tại ít nhất 24 giờ.');
    if (!fitsAvailability(body.newScheduledAtUtc, a.durationMinutes))
      return fail(409, 'Giờ này nằm ngoài lịch rảnh của huấn luyện viên.');
    if (overlaps(body.newScheduledAtUtc, a.durationMinutes, a.id))
      return fail(409, 'Trùng giờ với một buổi khác.');
    a.pendingChange = {
      id: nextId('chg'),
      appointmentId: a.id,
      requestedByRole: role,
      oldScheduledAtUtc: a.scheduledAtUtc,
      newScheduledAtUtc: body.newScheduledAtUtc,
      reason: body.reason,
      isEmergency: body.isEmergency,
      status: 'Pending',
      awaitingMyResponse: false,
      createdAtUtc: new Date().toISOString(),
      decidedAtUtc: null,
      decisionNote: null,
    };
    return ok(withViewer(a, role));
  }),

  http.post(path('/appointments/changes/:changeId/:action'), ({ params }) => {
    const role = roleOf();
    const a = appointments.find((item) => item.pendingChange?.id === params.changeId);
    if (!a?.pendingChange) return fail(404, 'Không tìm thấy yêu cầu dời lịch.');
    if (params.action === 'accept') {
      a.scheduledAtUtc = a.pendingChange.newScheduledAtUtc;
    } else if (params.action !== 'decline' && params.action !== 'withdraw') {
      return fail(404, 'Không hợp lệ.');
    }
    a.pendingChange = null;
    return ok(withViewer(a, role));
  }),

  http.post(path('/marketplace/orders/appointments/:id/consent-reassign'), () =>
    fail(409, 'Buổi tập này không có yêu cầu điều phối đổi huấn luyện viên.'),
  ),

  // Trainer change (BF05)
  http.get(path(ENDPOINTS.trainerChanges.list), () => ok(trainerChanges)),

  http.get(path(ENDPOINTS.trainerChanges.managedAssignments), () => {
    const view: ManagedAssignmentDto = {
      id: assignment.id,
      memberProfileId: MEMBER.id,
      memberName: MEMBER.name,
      trainerProfileId: assignment.trainerProfileId,
      trainerName: TRAINERS[assignment.trainerProfileId] ?? '',
      gymBranchId: 'br-demo',
      gymBranchName: 'Demo Branch',
      status: 'Active',
      startsAtUtc: '2026-10-01T00:00:00.000Z',
      endsAtUtc: '2026-12-31T00:00:00.000Z',
      totalSessions: assignment.totalSessions,
      sessionsUsed: assignment.sessionsUsed,
      openTrainerChange: openChange(),
    };
    return ok([view]);
  }),

  http.post(path('/coaching/assignments/:id/trainer-changes/request'), async ({ request }) => {
    if (openChange()) return fail(409, 'Đã có một đề nghị đổi huấn luyện viên đang xử lý.');
    const body = (await request.json()) as { reason: string };
    const change: TrainerChangeDto = {
      id: nextId('tc'),
      assignmentId: assignment.id,
      memberProfileId: MEMBER.id,
      memberName: MEMBER.name,
      currentTrainerProfileId: assignment.trainerProfileId,
      currentTrainerName: TRAINERS[assignment.trainerProfileId] ?? '',
      proposedTrainerProfileId: null,
      proposedTrainerName: null,
      requestedByRole: 'Member',
      reason: body.reason,
      effectiveAtUtc: null,
      status: 'PendingManager',
      createdAtUtc: new Date().toISOString(),
      decidedAtUtc: null,
    };
    trainerChanges.push(change);
    return ok(change);
  }),

  http.post(path('/coaching/assignments/:id/trainer-changes'), async ({ request }) => {
    const body = (await request.json()) as {
      newTrainerProfileId: string;
      reason?: string;
      changeId?: string;
    };
    if (body.newTrainerProfileId === assignment.trainerProfileId)
      return fail(400, 'Huấn luyện viên mới phải khác huấn luyện viên hiện tại.');
    let change = body.changeId ? trainerChanges.find((c) => c.id === body.changeId) : undefined;
    if (!change) {
      if (openChange()) return fail(409, 'Đã có một đề nghị đổi huấn luyện viên đang xử lý.');
      change = {
        id: nextId('tc'),
        assignmentId: assignment.id,
        memberProfileId: MEMBER.id,
        memberName: MEMBER.name,
        currentTrainerProfileId: assignment.trainerProfileId,
        currentTrainerName: TRAINERS[assignment.trainerProfileId] ?? '',
        proposedTrainerProfileId: null,
        proposedTrainerName: null,
        requestedByRole: 'Manager',
        reason: body.reason ?? '',
        effectiveAtUtc: null,
        status: 'PendingManager',
        createdAtUtc: new Date().toISOString(),
        decidedAtUtc: null,
      };
      trainerChanges.push(change);
    }
    change.proposedTrainerProfileId = body.newTrainerProfileId;
    change.proposedTrainerName = TRAINERS[body.newTrainerProfileId] ?? 'New Trainer';
    change.status = 'PendingMember';
    return ok(change);
  }),

  http.post(path('/coaching/trainer-changes/:changeId/respond'), async ({ params, request }) => {
    const change = trainerChanges.find((c) => c.id === params.changeId);
    if (!change || change.status !== 'PendingMember')
      return fail(409, 'Đề nghị đổi huấn luyện viên không còn chờ xác nhận.');
    const body = (await request.json()) as { accept: boolean };
    if (body.accept && change.proposedTrainerProfileId) {
      assignment.trainerProfileId = change.proposedTrainerProfileId;
      const newName = TRAINERS[assignment.trainerProfileId] ?? '';
      for (const a of appointments) {
        if (isOpen(a) && new Date(a.scheduledAtUtc).getTime() > Date.now()) {
          a.trainerProfileId = assignment.trainerProfileId;
          a.trainerName = newName;
        }
      }
      change.status = 'Applied';
    } else {
      change.status = 'DeclinedByMember';
    }
    change.decidedAtUtc = new Date().toISOString();
    return ok(change);
  }),
];
