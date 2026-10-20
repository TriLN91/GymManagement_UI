import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExerciseReferenceLibrary } from './ExerciseReferenceLibrary';

import i18n from '@/i18n';

const hooks = vi.hoisted(() => ({
  exercises: vi.fn(),
  referenceSets: vi.fn(),
  createSet: vi.fn(),
  createExercise: vi.fn(),
  referenceSet: vi.fn(),
}));

vi.mock('../model/useMovementReferences', () => ({
  useExercises: hooks.exercises,
  useReferenceSets: hooks.referenceSets,
  useCreateReferenceSet: hooks.createSet,
  useCreateExercise: hooks.createExercise,
  useReferenceSet: hooks.referenceSet,
}));

describe('ReferenceSetList', () => {
  const createSetMutation = vi.fn();

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
    createSetMutation.mockResolvedValue({ id: 'set-1' });
    createSetMutation.mockClear();
    hooks.createSet.mockReturnValue({
      mutateAsync: createSetMutation,
      isPending: false,
      error: null,
    });
    hooks.createExercise.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
    hooks.referenceSet.mockReturnValue({ data: undefined, isLoading: false, error: null });
  });

  it('opens an existing workspace without mutating the reference catalog', () => {
    render(
      <MemoryRouter>
        <ExerciseReferenceLibrary />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Exercise Reference Library' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /Back Squat/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Continue preparation/i }));
    expect(createSetMutation).not.toHaveBeenCalled();
  });

  it('requires an explicit squat confirmation before creating a reference for an unconfigured exercise', async () => {
    hooks.referenceSets.mockReturnValue({ data: [], error: null, isLoading: false });
    render(
      <MemoryRouter>
        <ExerciseReferenceLibrary />
      </MemoryRouter>,
    );
    expect(screen.getByRole('cell', { name: 'Not configured' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Start preparation/i }));
    expect(createSetMutation).not.toHaveBeenCalled();
    const create = screen.getByRole('button', { name: 'Create SQUAT reference workspace' });
    expect(create).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(create);
    await waitFor(() =>
      expect(createSetMutation).toHaveBeenCalledWith({
        exerciseId: 'exercise-1',
        pattern: 'SQUAT',
      }),
    );
  });

  it('requires fresh confirmation when changing the movement processor', async () => {
    hooks.referenceSets.mockReturnValue({ data: [], error: null, isLoading: false });
    render(
      <MemoryRouter>
        <ExerciseReferenceLibrary />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /Start preparation/i }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText('Pattern'), { target: { value: 'HINGE' } });
    const create = screen.getByRole('button', { name: 'Create HINGE reference workspace' });
    expect(create).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(create);
    await waitFor(() =>
      expect(createSetMutation).toHaveBeenCalledWith({
        exerciseId: 'exercise-1',
        pattern: 'HINGE',
      }),
    );
  });
});
