import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { progressionApi } from '../api/progressionApi';
import type { ProgressionState, ScheduleOverview } from '../api/types';

import { AchievementsPage } from './ProgressionPage';

import i18n from '@/i18n';

vi.mock('../api/progressionApi', () => ({
  progressionApi: {
    getState: vi.fn(),
    getHistory: vi.fn(),
    getSchedule: vi.fn(),
    setSchedule: vi.fn(),
    markBadgeSeen: vi.fn(),
    setPrimaryDistanceSource: vi.fn(),
    getRecovery: vi.fn(),
    reportRecovery: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  },
}));

const api = vi.mocked(progressionApi);

const state: ProgressionState = {
  stateVersion: 'v1',
  businessDate: '2026-10-08',
  timeZone: 'UTC+07:00',
  ruleVersion: 'cf05-proposed-2026-10-16',
  streak: { current: 4, best: 9, scheduleConfigured: true, today: 'Pending' },
  xp: {
    totalConfirmed: 150,
    pending: [
      {
        businessDate: '2026-10-08',
        provisionalAmount: 50,
        rewardType: 'WorkoutCompleted',
        confirmsAtUtc: '2026-10-09T17:00:00Z',
      },
    ],
  },
  completedWorkouts: 12,
  distance: {
    totalKm: null,
    primaryProvider: null,
    availableProviders: ['Strava', 'HealthConnect'],
    sourceSelectionRequired: true,
    quarantinedActivities: 0,
  },
  badges: [
    {
      id: 'award-1',
      code: 'WORKOUT_COUNT',
      name: 'Workout Milestone',
      tier: 'Bronze',
      threshold: 10,
      reason: 'Workout Milestone Bronze: reached 10',
      awardedAtUtc: '2026-10-07T03:00:00Z',
      seen: false,
      ruleVersion: 'cf05-proposed-2026-10-16',
    },
  ],
  nextBadges: [
    {
      code: 'WORKOUT_COUNT',
      name: 'Workout Milestone',
      tier: 'Bronze',
      threshold: 20,
      current: 12,
    },
  ],
  activePause: null,
  days: [
    { day: '2026-10-07', status: 'Completed', expectedDayNumber: 2 },
    { day: '2026-10-08', status: 'Pending', expectedDayNumber: 1 },
  ],
};

const schedule: ScheduleOverview = {
  current: {
    id: 's1',
    workoutPlanId: 'p1',
    isoWeekdays: [1, 3, 5],
    effectiveFromDay: '2026-10-01',
    effectiveToDay: null,
  },
  upcoming: null,
  hasActivePlan: true,
  planDayNumbers: [1, 2],
  businessDate: '2026-10-08',
};

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AchievementsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AchievementsPage (CF05 progression)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.clearAllMocks();
    api.getState.mockResolvedValue(state);
    api.getSchedule.mockResolvedValue(schedule);
    api.getRecovery.mockResolvedValue([]);
    api.getHistory.mockResolvedValue({
      from: '2026-09-09',
      to: '2026-10-08',
      summary: {
        fitFlexWorkouts: 3,
        ptSessions: 1,
        externalActivities: 0,
        distanceKm: 0,
        scheduledCompleted: 3,
        scheduledMissed: 1,
        scheduledPaused: 0,
        xpConfirmed: 150,
      },
      items: [],
      days: [],
    });
    api.markBadgeSeen.mockResolvedValue({ ...state.badges[0]!, seen: true });
  });

  it('shows backend values instead of client-computed ones and marks a new badge as seen once', async () => {
    renderPage();
    expect(await screen.findByText('Your progression')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Best: 9')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText(/50 XP being verified/)).toBeInTheDocument();
    expect(screen.getByText('Choose a source')).toBeInTheDocument();
    const earned = screen.getByRole('region', { name: 'Badges earned' });
    expect(within(earned).getByText('Workout Milestone')).toBeInTheDocument();
    expect(within(earned).getByText('Workout Milestone Bronze: reached 10')).toBeInTheDocument();
    await waitFor(() => expect(api.markBadgeSeen).toHaveBeenCalledTimes(1));
    expect(api.markBadgeSeen).toHaveBeenCalledWith('award-1');
  });

  it('shows an error with retry instead of zero values when state fails to load', async () => {
    api.getState.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(state);
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent("couldn't load");
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Your progression')).toBeInTheDocument();
  });

  it('saves training days only after a change and sends ISO weekdays', async () => {
    api.setSchedule.mockResolvedValue({
      ...schedule,
      upcoming: {
        ...schedule.current!,
        id: 's2',
        isoWeekdays: [1, 3, 5, 6],
        effectiveFromDay: '2026-10-09',
      },
    });
    renderPage();
    const save = await screen.findByRole('button', { name: 'Save training days' });
    expect(save).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Sat' }));
    expect(save).toBeEnabled();
    await userEvent.click(save);
    await waitFor(() => expect(api.setSchedule).toHaveBeenCalledWith([1, 3, 5, 6]));
  });

  it('reports recovery with severity and pauses the plan', async () => {
    api.reportRecovery.mockResolvedValue({
      id: 'r1',
      businessDate: '2026-10-08',
      reportedAtUtc: '2026-10-08T02:00:00Z',
      severity: 'Severe',
      symptom: 'Injury',
      bodyArea: 'Knee',
      notes: null,
      revision: 1,
      editable: true,
    });
    api.pause.mockResolvedValue({
      id: 'p1',
      startDay: '2026-10-08',
      endDay: null,
      recoveryReportId: null,
      reason: null,
      resumeProposedAtUtc: null,
      resumeProposalNote: null,
    });
    renderPage();
    await userEvent.click(await screen.findByLabelText(/Severe/));
    await userEvent.selectOptions(screen.getByLabelText('What are you feeling?'), 'Injury');
    await userEvent.type(screen.getByLabelText('Body area (optional)'), 'Knee');
    await userEvent.click(screen.getByRole('button', { name: 'Save report' }));
    await waitFor(() =>
      expect(api.reportRecovery).toHaveBeenCalledWith({
        severity: 'Severe',
        symptom: 'Injury',
        bodyArea: 'Knee',
        notes: null,
      }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Pause my plan from today' }));
    await waitFor(() => expect(api.pause).toHaveBeenCalledTimes(1));
  });
});
