import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { weeklyProgressionApi, type WeeklyReview } from '../api/weeklyProgressionApi';

import { WeeklyProgressionPage } from './WeeklyProgressionPage';

vi.mock('../api/weeklyProgressionApi', () => ({
  progressionGoals: ['Strength', 'Mobility'],
  weeklyProgressionApi: {
    exercises: vi.fn(),
    history: vi.fn(),
    evaluate: vi.fn(),
    review: vi.fn(),
    resolveRecovery: vi.fn(),
  },
}));
const review: WeeklyReview = {
  id: 'review-1',
  exerciseId: 'squat',
  goal: 'Strength',
  weekOf: '2026-10-26',
  assignmentId: null,
  status: 'pending_review',
  evidenceAsOfUtc: '2026-10-27T00:00:00Z',
  reviewedAtUtc: null,
  evaluation: {
    ruleVersion: 'weekly-v1',
    exerciseName: 'Squat',
    windowDays: 25,
    requiredSessions: 5,
    validSessions: 5,
    completionRatio: 1,
    averageRpe: 7,
    performanceTrendPercent: 0,
    conclusion: 'consider_increase',
    suggestedLoadChangePercent: 2.5,
    reason: 'Five saved sessions support review.',
    handoff: 'CF01: confirmation required. No plan has been changed.',
    evidence: [
      {
        source: 'member_workout',
        id: 'workout-1',
        occurredAtUtc: '2026-10-26T12:00:00Z',
        use: 'threshold_and_performance',
        detail: 'Self-reported workout',
      },
    ],
    limitations: ['Not a medical diagnosis.'],
  },
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(weeklyProgressionApi.exercises).mockResolvedValue([
    { id: 'squat', name: 'Squat', muscleGroup: 'Quads' },
  ]);
  vi.mocked(weeklyProgressionApi.history).mockResolvedValue([]);
});
afterEach(cleanup);
function mount() {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        })
      }
    >
      <WeeklyProgressionPage />
    </QueryClientProvider>,
  );
}
it('evaluates real API input, displays provenance and acknowledges without applying a plan', async () => {
  const user = userEvent.setup();
  mount();
  await screen.findByText('No weekly reviews saved yet.');
  vi.mocked(weeklyProgressionApi.evaluate).mockResolvedValue(review);
  vi.mocked(weeklyProgressionApi.history).mockResolvedValue([review]);
  await user.click(screen.getByRole('button', { name: 'Evaluate this week' }));
  await waitFor(() =>
    expect(weeklyProgressionApi.evaluate).toHaveBeenCalledWith('squat', 'Strength'),
  );
  expect(await screen.findByText(review.evaluation.reason)).toBeInTheDocument();
  await user.click(screen.getByText('Evidence and limitations (1 records)'));
  expect(screen.getByText('Self-reported workout')).toBeInTheDocument();
  vi.mocked(weeklyProgressionApi.review).mockResolvedValue({ ...review, status: 'reviewed' });
  vi.mocked(weeklyProgressionApi.history).mockResolvedValue([{ ...review, status: 'reviewed' }]);
  await user.click(screen.getByRole('button', { name: 'Mark as reviewed (no plan changes)' }));
  await waitFor(() => expect(weeklyProgressionApi.review).toHaveBeenCalledWith('review-1'));
});
it('offers recovery from loading failure rather than showing a successful empty history', async () => {
  vi.mocked(weeklyProgressionApi.history).mockRejectedValueOnce(new Error('offline'));
  mount();
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load progression');
  expect(screen.queryByText('No weekly reviews saved yet.')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('No weekly reviews saved yet.')).toBeInTheDocument();
});
