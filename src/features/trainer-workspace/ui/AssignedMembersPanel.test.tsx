import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assignmentsApi } from '../api/assignmentsApi';
import type { AssignmentDto } from '../api/types';

import { AssignedMembersPanel } from './AssignedMembersPanel';

const assignment = (overrides: Partial<AssignmentDto>): AssignmentDto => ({
  id: 'as-1',
  memberProfileId: 'mp-1',
  memberName: 'Ari Nguyen',
  trainerProfileId: 'tp-1',
  trainerName: 'Paolo',
  status: 'Active',
  startsAtUtc: '2026-09-15T00:00:00Z',
  endsAtUtc: '2026-12-15T00:00:00Z',
  isCurrent: true,
  canReadFitness: true,
  canManageWorkout: true,
  canManageNutrition: false,
  ...overrides,
});

const twoAssignments = [
  assignment({}),
  assignment({ id: 'as-2', memberProfileId: 'mp-2', memberName: 'Bao Le', canReadFitness: false }),
];

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AssignedMembersPanel />
    </QueryClientProvider>,
  );
}

describe('AssignedMembersPanel', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('lists the members assigned to the trainer', async () => {
    vi.spyOn(assignmentsApi, 'listMine').mockResolvedValue(twoAssignments);
    renderPanel();
    expect(await screen.findByText('Ari Nguyen')).toBeInTheDocument();
    expect(screen.getByText('Bao Le')).toBeInTheDocument();
  });

  it('disables the profile button without read access and loads the profile on demand', async () => {
    vi.spyOn(assignmentsApi, 'listMine').mockResolvedValue(twoAssignments);
    const profile = vi.spyOn(assignmentsApi, 'getMemberProfile').mockResolvedValue({
      memberProfileId: 'mp-1',
      revision: 1,
      goal: { goalType: 'Strength', description: null, targetWeightKg: null, targetDate: null },
      training: {
        experienceLevel: 'beginner',
        weeklyWorkoutDays: 3,
        sessionDurationMinutes: 45,
        hasLimitations: false,
        limitationNotes: null,
      },
      nutrition: null,
      missingWorkoutInput: [],
      missingNutritionInput: [],
    });
    renderPanel();
    await screen.findByText('Ari Nguyen');
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[1]).toBeDisabled();
    expect(profile).not.toHaveBeenCalled();

    await userEvent.setup().click(buttons[0]!);
    expect(await screen.findByText(/beginner/)).toBeInTheDocument();
    expect(profile).toHaveBeenCalledWith('mp-1');
  });

  it('shows an empty state', async () => {
    vi.spyOn(assignmentsApi, 'listMine').mockResolvedValue([]);
    renderPanel();
    expect(await screen.findByText('Bạn chưa được gán Member nào.')).toBeInTheDocument();
  });
});
