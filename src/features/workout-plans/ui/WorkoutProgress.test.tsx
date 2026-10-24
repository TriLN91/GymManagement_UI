import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SessionView } from '../api/types';
import type { WorkoutDayPlan } from '../model/workoutFlowTypes';

import { WorkoutProgress } from './WorkoutProgress';

import i18n from '@/i18n';

const queries = vi.hoisted(() => ({
  live: { week: [] as WorkoutDayPlan[], isPending: false, isError: false, refetch: vi.fn() },
  sessions: {
    data: undefined as SessionView[] | undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  },
}));

vi.mock('../model/useLiveWorkout', () => ({
  useLiveWorkoutWeek: () => queries.live,
  useWorkoutSessions: () => queries.sessions,
}));

function renderProgress() {
  return render(
    <MemoryRouter>
      <WorkoutProgress />
    </MemoryRouter>,
  );
}

describe('WorkoutProgress data states', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.clearAllMocks();
    Object.assign(queries.live, { week: [], isPending: false, isError: false });
    Object.assign(queries.sessions, { data: undefined, isPending: false, isError: false });
  });

  it.each(['live', 'sessions'] as const)(
    'does not show zero metrics while %s is loading',
    (query) => {
      queries[query].isPending = true;
      renderProgress();
      expect(screen.getByRole('status')).toHaveTextContent('Loading your schedule');
      expect(screen.queryByRole('heading', { name: 'Workout data' })).not.toBeInTheDocument();
      expect(screen.queryByText('0 kg')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Complete your first workout to see progress data.'),
      ).not.toBeInTheDocument();
    },
  );

  it.each(['live', 'sessions'] as const)(
    'offers retry without zero metrics when %s fails',
    async (query) => {
      queries[query].isError = true;
      renderProgress();
      expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load your plan or schedule");
      expect(screen.queryByRole('heading', { name: 'Workout data' })).not.toBeInTheDocument();
      expect(screen.queryByText('0 min')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
      expect(queries.live.refetch).toHaveBeenCalledOnce();
      expect(queries.sessions.refetch).toHaveBeenCalledOnce();
    },
  );

  it('shows a genuine empty result only after both requests succeed', () => {
    queries.sessions.data = [];
    renderProgress();
    expect(screen.getByText('0 kg')).toBeInTheDocument();
    expect(
      screen.getByText('Complete your first workout to see progress data.'),
    ).toBeInTheDocument();
  });

  it('preserves missed, pending, paused and no-plan statuses returned by the server', () => {
    queries.sessions.data = [];
    queries.live.week = (['missed', 'pending', 'paused', 'none'] as const).map((status, index) => ({
      id: `2026-10-${19 + index}`,
      status,
      weekday: 'monday',
      dayNumber: null,
      versionId: null,
      isToday: false,
      durationMinutes: 0,
      exercises: [],
    }));
    renderProgress();
    for (const label of ['Missed', 'Waiting for sync', 'Paused', 'No plan']) {
      expect(screen.getByText(label, { exact: true })).toBeInTheDocument();
    }
    expect(screen.queryByText('Planned', { exact: true })).not.toBeInTheDocument();
  });

  it('totals only recorded sets from completed sessions', () => {
    const session: SessionView = {
      id: 'completed',
      revision: 1,
      workoutPlanVersionId: null,
      status: 'Completed',
      scheduledAtUtc: '2026-10-20T01:00:00Z',
      completedAtUtc: '2026-10-20T02:00:00Z',
      notes: null,
      exercises: [
        {
          id: 'squat',
          exerciseId: 'squat',
          sortOrder: 1,
          plannedSets: 3,
          plannedReps: 10,
          plannedDurationSeconds: null,
          logs: [
            {
              setNumber: 1,
              repsCompleted: 5,
              weightKg: 40,
              durationSeconds: 120,
              perceivedExertion: null,
              notes: null,
            },
          ],
        },
      ],
    };
    queries.sessions.data = [session, { ...session, id: 'cancelled', status: 'Cancelled' }];
    renderProgress();
    expect(screen.getAllByText('200 kg')).toHaveLength(2);
    expect(screen.getByText('2 min')).toBeInTheDocument();
    expect(screen.queryByText('400 kg')).not.toBeInTheDocument();
  });
});
