import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardWidgetState } from './DashboardWidgetState';

const labels = {
  loadingLabel: 'Loading widget',
  emptyLabel: 'No records',
  errorLabel: 'Could not load',
};

describe('DashboardWidgetState', () => {
  it('renders loading, empty and error states explicitly', () => {
    const { rerender } = render(
      <DashboardWidgetState resource={{ state: 'loading' }} {...labels}>
        {() => null}
      </DashboardWidgetState>,
    );
    expect(screen.getByRole('status', { name: 'Loading widget' })).toBeInTheDocument();

    rerender(
      <DashboardWidgetState resource={{ state: 'empty' }} {...labels}>
        {() => null}
      </DashboardWidgetState>,
    );
    expect(screen.getByText('No records')).toBeInTheDocument();

    rerender(
      <DashboardWidgetState resource={{ state: 'error' }} {...labels}>
        {() => null}
      </DashboardWidgetState>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load');
  });

  it('renders loaded content and treats an empty loaded array as empty', () => {
    const { rerender } = render(
      <DashboardWidgetState resource={{ state: 'loaded', data: ['ready'] }} {...labels}>
        {(data) => <span>{data[0]}</span>}
      </DashboardWidgetState>,
    );
    expect(screen.getByText('ready')).toBeInTheDocument();

    rerender(
      <DashboardWidgetState resource={{ state: 'loaded', data: [] }} {...labels}>
        {() => <span>Loaded</span>}
      </DashboardWidgetState>,
    );
    expect(screen.getByText('No records')).toBeInTheDocument();
  });
});
