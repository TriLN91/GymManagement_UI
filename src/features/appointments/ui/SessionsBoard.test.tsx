import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { appointmentsApi } from '../api/appointmentsApi';
import type { AppointmentDto, SessionAssignmentDto } from '../api/types';

import { SessionsBoard } from './SessionsBoard';

vi.mock('../api/appointmentsApi', () => ({
  appointmentsApi: {
    listMine: vi.fn(),
    listAssignments: vi.fn(),
    getAssignmentAvailability: vi.fn(),
    propose: vi.fn(),
    trainerNoShow: vi.fn(),
    listTrainerChanges: vi.fn(),
  },
}));

const assignment: SessionAssignmentDto = {
  id: 'as-1',
  memberProfileId: 'm-1',
  memberName: 'Maya',
  trainerProfileId: 't-1',
  trainerName: 'Paolo',
  gymBranchId: null,
  gymBranchName: null,
  status: 'Active',
  startsAtUtc: '2026-10-01T00:00:00Z',
  endsAtUtc: '2026-12-31T00:00:00Z',
  totalSessions: 4,
  sessionsUsed: 0,
  sessionsRemaining: 4,
  minNoticeHours: 48,
  openTrainerChange: null,
};

const missed: AppointmentDto = {
  id: 'ap-1',
  coachingAssignmentId: 'as-1',
  gymId: 'g-1',
  gymBranchId: null,
  gymBranchName: null,
  memberProfileId: 'm-1',
  memberName: 'Maya',
  trainerProfileId: 't-1',
  trainerName: 'Paolo',
  originalTrainerProfileId: 't-1',
  originalTrainerName: 'Paolo',
  scheduledAtUtc: '2026-11-20T02:00:00Z',
  durationMinutes: 60,
  status: 'Cancelled',
  notes: null,
  proposedByRole: 'Member',
  awaitingMyResponse: false,
  isReassigned: false,
  reassignmentReason: null,
  memberConsentApproved: false,
  consumedSession: false,
  cancelReason: 'Studio closed',
  cancelledAtUtc: '2026-11-10T00:00:00Z',
  completedAtUtc: null,
  needsMakeup: true,
  makeupOfAppointmentId: null,
  pendingChange: null,
};

function renderBoard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <SessionsBoard role="Member" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.resetAllMocks();
});

function mockApi(appointments: AppointmentDto[]) {
  vi.mocked(appointmentsApi.listMine).mockResolvedValue(appointments);
  vi.mocked(appointmentsApi.listAssignments).mockResolvedValue([assignment]);
  vi.mocked(appointmentsApi.getAssignmentAvailability).mockResolvedValue({
    trainerProfileId: 't-1',
    utcOffsetHours: 7,
    slots: [],
  });
  vi.mocked(appointmentsApi.listTrainerChanges).mockResolvedValue([]);
}

it('shows the Offering notice window on the package', async () => {
  mockApi([]);
  renderBoard();
  expect(await screen.findByText('Huỷ hoặc dời miễn phí trước buổi tập 48 giờ')).toBeVisible();
});

it('offers a make-up for a session the Trainer side ended and books it linked to that session', async () => {
  mockApi([missed]);
  vi.mocked(appointmentsApi.propose).mockResolvedValue({ ...missed, id: 'ap-2' });
  const user = userEvent.setup();
  renderBoard();

  expect(await screen.findByText(/không bị trừ/)).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Hẹn lịch khác' }));
  expect(await screen.findByText(/Hẹn bù cho buổi ngày/)).toBeVisible();

  fireEvent.change(screen.getByLabelText('Ngày giờ'), { target: { value: '2026-12-01T09:00' } });
  await user.click(screen.getByRole('button', { name: 'Gửi đề xuất' }));

  await waitFor(() => expect(appointmentsApi.propose).toHaveBeenCalledTimes(1));
  expect(vi.mocked(appointmentsApi.propose).mock.calls[0]?.[0]).toMatchObject({
    coachingAssignmentId: 'as-1',
    makeupOfAppointmentId: 'ap-1',
  });
});

it('does not offer a make-up once one is booked', async () => {
  mockApi([{ ...missed, needsMakeup: false }]);
  renderBoard();
  await screen.findByText('Huỷ hoặc dời miễn phí trước buổi tập 48 giờ');
  expect(screen.queryByRole('button', { name: 'Hẹn lịch khác' })).not.toBeInTheDocument();
});

it('lets the Member report a Trainer no-show on a session that already started', async () => {
  mockApi([
    {
      ...missed,
      id: 'ap-3',
      status: 'Scheduled',
      cancelReason: null,
      needsMakeup: false,
      scheduledAtUtc: new Date(Date.now() - 3_600_000).toISOString(),
    },
  ]);
  vi.mocked(appointmentsApi.trainerNoShow).mockResolvedValue({
    ...missed,
    status: 'TrainerNoShow',
  });
  const user = userEvent.setup();
  renderBoard();
  await user.click(await screen.findByRole('button', { name: 'Huấn luyện viên vắng mặt' }));
  await waitFor(() => expect(appointmentsApi.trainerNoShow).toHaveBeenCalledWith('ap-3'));
});
