import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';

import { appointmentsApi } from '../api/appointmentsApi';
import type { AppointmentDto } from '../api/types';

import { AppointmentCard } from './AppointmentCard';

import i18n from '@/i18n';

const notices = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast: notices }));
vi.mock('../api/appointmentsApi', () => ({
  appointmentsApi: { complete: vi.fn(), confirm: vi.fn(), dispute: vi.fn() },
}));

const appointment: AppointmentDto = {
  id: 'session-1',
  coachingAssignmentId: 'assignment-1',
  gymId: 'gym-1',
  gymBranchId: null,
  gymBranchName: null,
  memberProfileId: 'member-1',
  memberName: 'Member',
  trainerProfileId: 'trainer-1',
  trainerName: 'Trainer',
  originalTrainerProfileId: 'trainer-1',
  originalTrainerName: 'Trainer',
  scheduledAtUtc: '2020-01-01T00:00:00Z',
  durationMinutes: 60,
  status: 'Scheduled',
  notes: null,
  proposedByRole: 'Trainer',
  awaitingMyResponse: false,
  isReassigned: false,
  reassignmentReason: null,
  memberConsentApproved: false,
  consumedSession: false,
  cancelReason: null,
  cancelledAtUtc: null,
  completedAtUtc: null,
  needsMakeup: false,
  makeupOfAppointmentId: null,
  pendingChange: null,
};
function mount(value: AppointmentDto, role: 'Member' | 'Trainer' = 'Member') {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AppointmentCard appointment={value} role={role} locale="en-US" />
    </QueryClientProvider>,
  );
}
beforeEach(async () => {
  vi.resetAllMocks();
  await i18n.changeLanguage('en');
});

it('lets only the Member confirm a reported session', async () => {
  const value = { ...appointment, status: 'AwaitingMemberConfirmation' as const };
  vi.mocked(appointmentsApi.confirm).mockResolvedValue({ ...value, status: 'Completed' });
  mount(value);
  fireEvent.click(screen.getByRole('button', { name: 'Confirm the session happened' }));
  await waitFor(() => expect(appointmentsApi.confirm).toHaveBeenCalledWith('session-1'));
  await waitFor(() =>
    expect(notices.success).toHaveBeenCalledWith('Session confirmed as completed.'),
  );
});

it('does not offer Member confirmation to the Trainer', () => {
  mount({ ...appointment, status: 'AwaitingMemberConfirmation' }, 'Trainer');
  expect(
    screen.queryByRole('button', { name: 'Confirm the session happened' }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Dispute' })).not.toBeInTheDocument();
});

it('submits a Member no-show dispute with its reason', async () => {
  vi.mocked(appointmentsApi.dispute).mockResolvedValue({ ...appointment, status: 'Disputed' });
  mount({ ...appointment, status: 'NoShow', resultReportedAtUtc: '2026-10-28T00:00:00Z' });
  fireEvent.click(screen.getByRole('button', { name: 'Dispute' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I attended this session.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  await waitFor(() =>
    expect(appointmentsApi.dispute).toHaveBeenCalledWith('session-1', 'I attended this session.'),
  );
  await waitFor(() =>
    expect(notices.success).toHaveBeenCalledWith('Dispute sent. The gym will decide.'),
  );
});

it('preserves the dispute form on failure without claiming success', async () => {
  vi.mocked(appointmentsApi.dispute).mockRejectedValue(new Error('The review window has closed.'));
  mount({ ...appointment, status: 'TrainerNoShow', resultReportedAtUtc: null }, 'Trainer');
  fireEvent.click(screen.getByRole('button', { name: 'Dispute' }));
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Please review attendance.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
  await waitFor(() => expect(notices.error).toHaveBeenCalled());
  expect(screen.getByRole('textbox')).toHaveValue('Please review attendance.');
  expect(notices.success).not.toHaveBeenCalled();
});

it('does not expose a dispute endpoint for legacy no-show responses', () => {
  mount({ ...appointment, status: 'NoShow' });
  expect(screen.queryByRole('button', { name: 'Dispute' })).not.toBeInTheDocument();
});

it.each([
  ['Completed', 'Session marked completed.'],
  ['AwaitingMemberConfirmation', 'Reported. The Member has to confirm the session.'],
] as const)('uses the actual %s response for reporting feedback', async (status, message) => {
  vi.mocked(appointmentsApi.complete).mockResolvedValue({ ...appointment, status });
  mount(appointment, 'Trainer');
  fireEvent.click(screen.getByRole('button', { name: 'Report as taught' }));
  await waitFor(() => expect(notices.success).toHaveBeenCalledWith(message));
});
