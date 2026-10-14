import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { AssistantMessage } from '../model/types';

import { AssistantInteractionRenderer } from './AssistantPage';

const message = (interaction: AssistantMessage['interaction']): AssistantMessage => ({
  id: 'message-1',
  role: 'assistant',
  content: 'Choose one',
  createdAtUtc: '2026-10-14T00:00:00Z',
  interaction,
  interactionStatus: 'required',
});

describe('AssistantInteractionRenderer', () => {
  it('submits an allowlisted single choice', () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    render(
      <AssistantInteractionRenderer
        message={message({
          version: '1', type: 'single_choice', id: 'goal', title: 'Choose a goal',
          options: [{ value: 'strength', label: 'Build strength' }],
        })}
        onSubmit={submit}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Build strength' }));
    expect(submit).toHaveBeenCalledWith('strength');
  });

  it('collects and converts validated form values', () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    render(
      <AssistantInteractionRenderer
        message={message({
          version: '1', type: 'form', id: 'routine', title: 'Routine',
          fields: [
            { name: 'weeklyDays', label: 'Days', inputType: 'number', required: true, min: 1, max: 7 },
            { name: 'equipment', label: 'Equipment', inputType: 'text', required: true },
          ],
        })}
        onSubmit={submit}
      />,
    );
    fireEvent.change(screen.getByLabelText('Days'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Equipment'), { target: { value: 'Dumbbells' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(submit).toHaveBeenCalledWith({ weeklyDays: 3, equipment: 'Dumbbells' });
  });

  it('renders server data as read-only content', () => {
    render(
      <AssistantInteractionRenderer
        message={message({ version: '1', type: 'data_card', id: 'plan', title: 'Current plan', data: { name: 'Strength A' } })}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByText(/Strength A/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
