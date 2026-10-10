import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReferenceSetList } from './ReferenceSetList';

import i18n from '@/i18n';

const hooks = vi.hoisted(() => ({
  exercises: vi.fn(),
  referenceSets: vi.fn(),
  createSet: vi.fn(),
  createExercise: vi.fn(),
}));

vi.mock('../model/useMovementReferences', () => ({
  useExercises: hooks.exercises,
  useReferenceSets: hooks.referenceSets,
  useCreateReferenceSet: hooks.createSet,
  useCreateExercise: hooks.createExercise,
}));

describe('ReferenceSetList', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    hooks.exercises.mockReturnValue({
      data: [{ id: 'exercise-1', name: 'Back Squat', isActive: true }],
      error: null,
    });
    hooks.referenceSets.mockReturnValue({
      data: [
        {
          id: 'set-1',
          exerciseId: 'exercise-1',
          exerciseName: 'Back Squat',
          pattern: 'SQUAT',
          status: 'REVIEW_REQUIRED',
          sourceCount: 2,
          profileCount: 1,
          activeProfileCount: 0,
        },
      ],
      isLoading: false,
      error: null,
    });
    hooks.createSet.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
    hooks.createExercise.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
  });

  it('renders business-level reference set information and filters by exercise', () => {
    render(
      <MemoryRouter>
        <ReferenceSetList />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Movement Assessment' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Back Squat' })).toBeInTheDocument();
    expect(screen.getByText('Review required')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Exercise'), { target: { value: 'exercise-1' } });
    expect(hooks.referenceSets).toHaveBeenLastCalledWith('exercise-1');
  });
});
