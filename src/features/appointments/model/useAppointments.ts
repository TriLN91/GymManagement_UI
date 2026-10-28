import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { appointmentsApi } from '../api/appointmentsApi';
import type {
  AvailabilitySlotDto,
  CancelAppointmentBody,
  ProposeAppointmentBody,
  ProposeTrainerChangeBody,
  RescheduleAppointmentBody,
} from '../api/types';

import { QUERY_KEYS } from '@/shared/config/constants';

export function useMyAppointments() {
  return useQuery({
    queryKey: QUERY_KEYS.myAppointments('all'),
    queryFn: appointmentsApi.listMine,
  });
}

export function useSessionAssignments() {
  return useQuery({
    queryKey: QUERY_KEYS.appointmentAssignments(),
    queryFn: appointmentsApi.listAssignments,
  });
}

export function useAssignmentAvailability(assignmentId: string) {
  return useQuery({
    enabled: assignmentId !== '',
    queryKey: QUERY_KEYS.assignmentAvailability(assignmentId),
    queryFn: () => appointmentsApi.getAssignmentAvailability(assignmentId),
  });
}

export function useMyAvailability() {
  return useQuery({
    queryKey: QUERY_KEYS.trainerAvailability(),
    queryFn: appointmentsApi.getMyAvailability,
  });
}

export function useManagedAssignments() {
  return useQuery({
    queryKey: QUERY_KEYS.managedAssignments(),
    queryFn: appointmentsApi.listManaged,
  });
}

/** Runs one write and refreshes every CF04 query (a session change also moves the remaining-session count). */
function useAppointmentMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.appointments() }),
  });
}

export const useProposeAppointment = () =>
  useAppointmentMutation((body: ProposeAppointmentBody) => appointmentsApi.propose(body));
export const useAcceptAppointment = () =>
  useAppointmentMutation((id: string) => appointmentsApi.accept(id));
export const useDeclineAppointment = () =>
  useAppointmentMutation((v: { id: string; reason?: string }) =>
    appointmentsApi.decline(v.id, v.reason),
  );
export const useCancelAppointment = () =>
  useAppointmentMutation((v: { id: string; body: CancelAppointmentBody }) =>
    appointmentsApi.cancel(v.id, v.body),
  );
export const useCompleteAppointment = () =>
  useAppointmentMutation((id: string) => appointmentsApi.complete(id));
export const useConfirmAppointment = () =>
  useAppointmentMutation((id: string) => appointmentsApi.confirm(id));
export const useDisputeAppointment = () =>
  useAppointmentMutation(({ id, reason }: { id: string; reason: string }) =>
    appointmentsApi.dispute(id, reason),
  );
export const useNoShowAppointment = () =>
  useAppointmentMutation((id: string) => appointmentsApi.noShow(id));
export const useTrainerNoShowAppointment = () =>
  useAppointmentMutation((id: string) => appointmentsApi.trainerNoShow(id));
export const useRescheduleAppointment = () =>
  useAppointmentMutation((v: { id: string; body: RescheduleAppointmentBody }) =>
    appointmentsApi.reschedule(v.id, v.body),
  );
export const useAnswerReschedule = () =>
  useAppointmentMutation((v: { changeId: string; action: 'accept' | 'decline' | 'withdraw' }) =>
    v.action === 'accept'
      ? appointmentsApi.acceptChange(v.changeId)
      : v.action === 'decline'
        ? appointmentsApi.declineChange(v.changeId)
        : appointmentsApi.withdrawChange(v.changeId),
  );
export const useConsentReassign = () =>
  useAppointmentMutation((v: { id: string; accept: boolean }) =>
    appointmentsApi.consentReassign(v.id, v.accept),
  );
export const useSetAvailability = () =>
  useAppointmentMutation((slots: AvailabilitySlotDto[]) =>
    appointmentsApi.setMyAvailability(slots),
  );
export const useRequestTrainerChange = () =>
  useAppointmentMutation((v: { assignmentId: string; reason: string }) =>
    appointmentsApi.requestTrainerChange(v.assignmentId, v.reason),
  );
export const useProposeTrainerChange = () =>
  useAppointmentMutation((v: { assignmentId: string; body: ProposeTrainerChangeBody }) =>
    appointmentsApi.proposeTrainerChange(v.assignmentId, v.body),
  );
export const useRespondTrainerChange = () =>
  useAppointmentMutation((v: { changeId: string; accept: boolean }) =>
    appointmentsApi.respondTrainerChange(v.changeId, v.accept),
  );
