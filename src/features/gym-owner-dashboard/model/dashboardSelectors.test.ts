import { describe, expect, it } from 'vitest';

import { countTrainersByStatus, sortAlertsBySeverity } from './dashboardSelectors';

describe('Gym Owner dashboard selectors', () => {
  it('derives Trainer status counts from records rather than stored KPI values', () => {
    expect(
      countTrainersByStatus([
        { id: '1', name: 'A', status: 'active' },
        { id: '2', name: 'B', status: 'active' },
        { id: '3', name: 'C', status: 'hidden' },
      ]),
    ).toEqual([
      { status: 'active', count: 2 },
      { status: 'hidden', count: 1 },
      { status: 'suspended', count: 0 },
      { status: 'unlinked', count: 0 },
    ]);
  });

  it('orders alerts by severity and then by recency', () => {
    const sorted = sortAlertsBySeverity([
      {
        id: 'low',
        severity: 'low',
        message: 'appointmentUpcoming',
        subject: 'Low',
        occurredAt: '2026-10-01T12:00:00.000Z',
      },
      {
        id: 'high-old',
        severity: 'high',
        message: 'assignmentRequired',
        subject: 'High old',
        occurredAt: '2026-09-29T12:00:00.000Z',
      },
      {
        id: 'high-new',
        severity: 'high',
        message: 'appointmentCancelled',
        subject: 'High new',
        occurredAt: '2026-09-30T12:00:00.000Z',
      },
      {
        id: 'medium',
        severity: 'medium',
        message: 'trainerReviewPending',
        subject: 'Medium',
        occurredAt: '2026-10-01T12:00:00.000Z',
      },
    ]);

    expect(sorted.map((alert) => alert.id)).toEqual(['high-new', 'high-old', 'medium', 'low']);
  });
});
