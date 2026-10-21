import type {
  AppointmentDto,
  AvailabilityDto,
  AvailabilitySlotDto,
  CancelAppointmentBody,
  ManagedAssignmentDto,
  ProposeAppointmentBody,
  ProposeTrainerChangeBody,
  RescheduleAppointmentBody,
  SessionAssignmentDto,
  TrainerChangeDto,
} from './types';

import { apiGet, apiPost, apiPut } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

const E = ENDPOINTS.appointments;
const C = ENDPOINTS.trainerChanges;

export const appointmentsApi = {
  listMine: () => apiGet<AppointmentDto[]>(E.mine),
  listAssignments: () => apiGet<SessionAssignmentDto[]>(E.assignments),
  getAssignmentAvailability: (assignmentId: string) =>
    apiGet<AvailabilityDto>(E.availability, { params: { assignmentId } }),
  propose: (body: ProposeAppointmentBody) => apiPost<AppointmentDto>(E.create, body),
  accept: (id: string) => apiPost<AppointmentDto>(E.accept(id)),
  decline: (id: string, reason?: string) => apiPost<AppointmentDto>(E.decline(id), { reason }),
  cancel: (id: string, body: CancelAppointmentBody) => apiPost<AppointmentDto>(E.cancel(id), body),
  complete: (id: string) => apiPost<AppointmentDto>(E.complete(id)),
  noShow: (id: string) => apiPost<AppointmentDto>(E.noShow(id)),
  /** Member reports that the Trainer did not show up: not charged, a make-up session is offered. */
  trainerNoShow: (id: string) => apiPost<AppointmentDto>(E.trainerNoShow(id)),
  reschedule: (id: string, body: RescheduleAppointmentBody) =>
    apiPost<AppointmentDto>(E.reschedule(id), body),
  acceptChange: (changeId: string) => apiPost<AppointmentDto>(E.changeAccept(changeId), {}),
  declineChange: (changeId: string) => apiPost<AppointmentDto>(E.changeDecline(changeId), {}),
  withdrawChange: (changeId: string) => apiPost<AppointmentDto>(E.changeWithdraw(changeId)),

  /** Member answers a substitute Trainer the gym proposed for one confirmed session. */
  consentReassign: (id: string, accept: boolean) =>
    apiPost<unknown>(E.consentReassign(id), { accept }),

  getMyAvailability: () => apiGet<AvailabilityDto>(E.trainerAvailability),
  setMyAvailability: (slots: AvailabilitySlotDto[]) =>
    apiPut<AvailabilityDto>(E.trainerAvailability, {
      slots: slots.map(({ gymBranchId, dayOfWeek, startTime, endTime }) => ({
        gymBranchId,
        dayOfWeek,
        startTime,
        endTime,
      })),
    }),

  listTrainerChanges: () => apiGet<TrainerChangeDto[]>(C.list),
  listManaged: () => apiGet<ManagedAssignmentDto[]>(C.managedAssignments),
  requestTrainerChange: (assignmentId: string, reason: string) =>
    apiPost<TrainerChangeDto>(C.request(assignmentId), { reason }),
  proposeTrainerChange: (assignmentId: string, body: ProposeTrainerChangeBody) =>
    apiPost<TrainerChangeDto>(C.propose(assignmentId), body),
  respondTrainerChange: (changeId: string, accept: boolean) =>
    apiPost<TrainerChangeDto>(C.respond(changeId), { accept }),
};
