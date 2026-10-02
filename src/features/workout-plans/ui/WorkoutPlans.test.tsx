import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkoutPlans } from './WorkoutPlans';

import i18n from '@/i18n';

function renderPlans(props: React.ComponentProps<typeof WorkoutPlans> = {}) {
  return render(
    <MemoryRouter>
      <WorkoutPlans {...props} />
    </MemoryRouter>,
  );
}

describe('WorkoutPlans', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('opens the current protocol and links it to the weekly schedule', () => {
    renderPlans();

    expect(screen.queryByRole('heading', { name: 'Workout Plans' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Upper Body Hypertrophy Matrix // 4-Day Split',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view weekly schedule/i })).toHaveAttribute(
      'href',
      '/app/workout/schedule',
    );
  });

  it('shows the member assigned plans without category filters', () => {
    renderPlans();

    expect(screen.queryByRole('button', { name: 'Strength' })).not.toBeInTheDocument();
    expect(screen.getByText('Full Body Kinetic Foundation')).toBeInTheDocument();
    expect(screen.getByText('Lower Body Posterior Power')).toBeInTheDocument();
    expect(screen.getByText('Chest & Triceps Precision')).toBeInTheDocument();
  });

  it('renders a recoverable error state', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderPlans({ state: 'error', onRetry });

    expect(screen.getByRole('alert')).toHaveTextContent('Workout plans could not be loaded');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
