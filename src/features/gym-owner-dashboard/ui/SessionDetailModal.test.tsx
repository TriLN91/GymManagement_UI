import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SessionDetailModal, type TrainerOption } from './SessionDetailModal';

import type { TrainerAppointmentView } from '@/features/marketplace';

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockAppointment: TrainerAppointmentView = {
  id: 'appt-1',
  gymId: 'gym-1',
  gymBranchId: 'branch-1',
  gymBranchName: 'Quận 1 Main Branch',
  memberProfileId: 'mem-1',
  originalTrainerProfileId: 'pt-1',
  originalTrainerName: 'Nguyễn Văn PT',
  currentTrainerProfileId: 'pt-1',
  currentTrainerName: 'Nguyễn Văn PT',
  memberName: 'Lê Hoàng Nam',
  scheduledAtUtc: '2026-10-24T08:00:00Z',
  durationMinutes: 60,
  status: 'Scheduled',
  isReassigned: false,
  memberConsentApproved: true,
  reassignmentReason: null,
  completedAtUtc: null,
  notes: 'Tập trung cơ ngực và vai',
};

const mockTrainers: TrainerOption[] = [
  { id: 'pt-1', fullName: 'Nguyễn Văn PT', role: 'Head Coach' },
  { id: 'pt-2', fullName: 'Trần Thị PT', role: 'Senior Trainer' },
  { id: 'pt-3', fullName: 'Phạm Văn PT', role: 'Strength Coach' },
];

const mockAllAppointments: TrainerAppointmentView[] = [
  mockAppointment,
  // PT-2 is busy at the exact same hour
  {
    id: 'appt-2',
    gymId: 'gym-1',
    gymBranchId: 'branch-1',
    gymBranchName: 'Quận 1 Main Branch',
    memberProfileId: 'mem-2',
    originalTrainerProfileId: 'pt-2',
    originalTrainerName: 'Trần Thị PT',
    currentTrainerProfileId: 'pt-2',
    currentTrainerName: 'Trần Thị PT',
    memberName: 'Trần Minh Tuấn',
    scheduledAtUtc: '2026-10-24T08:00:00Z',
    durationMinutes: 60,
    status: 'Scheduled',
    isReassigned: false,
    memberConsentApproved: true,
    reassignmentReason: null,
    completedAtUtc: null,
    notes: null,
  },
];

describe('SessionDetailModal', () => {
  it('renders session details with attendance tab as default', () => {
    const handleClose = vi.fn();
    const handleUpdated = vi.fn();

    render(
      <SessionDetailModal
        appointment={mockAppointment}
        isOpen={true}
        onClose={handleClose}
        trainers={mockTrainers}
        allAppointments={mockAllAppointments}
        onAppointmentUpdated={handleUpdated}
      />,
    );

    expect(screen.getByText(/Lê Hoàng Nam/i)).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn PT')).toBeInTheDocument();
    expect(screen.getByText('Quận 1 Main Branch')).toBeInTheDocument();

    // Check tabs exist
    expect(screen.getByRole('button', { name: /Điểm danh|Attendance/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Nội dung bài tập|Workout Content/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gán \/ Đổi PT|Reassign PT/i })).toBeInTheDocument();
  });

  it('switches to Workout Content tab and shows exercises and notes', () => {
    render(
      <SessionDetailModal
        appointment={mockAppointment}
        isOpen={true}
        onClose={vi.fn()}
        trainers={mockTrainers}
        allAppointments={mockAllAppointments}
        onAppointmentUpdated={vi.fn()}
      />,
    );

    const workoutContentTab = screen.getByRole('button', {
      name: /Nội dung bài tập|Workout Content/i,
    });
    fireEvent.click(workoutContentTab);

    expect(screen.getByText(/Tập trung cơ ngực và vai/i)).toBeInTheDocument();
    expect(screen.getByText(/Ngực \(Chest\)/i)).toBeInTheDocument();
  });

  it('detects trainer conflict on Reassign PT tab', () => {
    render(
      <SessionDetailModal
        appointment={mockAppointment}
        isOpen={true}
        onClose={vi.fn()}
        trainers={mockTrainers}
        allAppointments={mockAllAppointments}
        onAppointmentUpdated={vi.fn()}
      />,
    );

    const reassignTab = screen.getByRole('button', { name: /Gán \/ Đổi PT|Reassign PT/i });
    fireEvent.click(reassignTab);

    // Trainer 2 should be marked as busy in the select dropdown
    const selectOptions = screen.getAllByRole('option');
    const pt2Option = selectOptions.find((opt) => opt.textContent?.includes('Trần Thị PT'));
    expect(pt2Option).toBeDefined();
    expect(pt2Option?.textContent).toContain('Đang bận ca khác');
  });
});
