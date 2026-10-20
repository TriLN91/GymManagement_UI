import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import type { ExerciseInput } from '../api/movementRuntimeApi';

import { ExerciseEditor } from './ExerciseEditor';

import i18n from '@/i18n';

it('submits identity, controlled muscles and GOOD footage together and retains the file after failure', async () => {
  await i18n.changeLanguage('en');
  const save = vi
    .fn<(input: ExerciseInput, file?: File) => Promise<boolean>>()
    .mockResolvedValueOnce(false)
    .mockResolvedValueOnce(true);
  const close = vi.fn();
  const view = render(
    <ExerciseEditor
      catalog={{ equipment: ['Bodyweight'], muscleGroups: [] }}
      supportedPatterns={['HINGE']}
      busy={false}
      onClose={close}
      onSave={save}
    />,
  );
  fireEvent.change(screen.getByPlaceholderText(/Deficit deadlift/), {
    target: { value: 'Hinge — bodyweight' },
  });
  fireEvent.change(screen.getAllByRole('combobox')[0]!, { target: { value: 'HINGE' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Inspect a muscle' }), {
    target: { value: 'hamstrings' },
  });
  fireEvent.change(screen.getAllByRole('combobox').at(-1)!, { target: { value: 'PRIMARY' } });
  const video = new File(['sample'], 'good.mp4', { type: 'video/mp4' });
  fireEvent.change(screen.getByLabelText('Choose an MP4 video'), { target: { files: [video] } });
  fireEvent.click(screen.getByRole('button', { name: 'Create & process GOOD footage' }));
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(save.mock.calls[0]![0].targetMuscles).toEqual([{ code: 'hamstrings', role: 'PRIMARY' }]);
  expect(save.mock.calls[0]![1]).toBe(video);
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Create & process GOOD footage' }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(save.mock.calls[1]![1]).toBe(video);
  view.unmount();
});

it('keeps catalog-only creation available after changing to a pattern without assessment support', async () => {
  await i18n.changeLanguage('en');
  const save = vi
    .fn<(input: ExerciseInput, file?: File) => Promise<boolean>>()
    .mockResolvedValue(true);
  const view = render(
    <ExerciseEditor
      catalog={{ equipment: [], muscleGroups: [] }}
      supportedPatterns={['HINGE']}
      busy={false}
      onClose={vi.fn()}
      onSave={save}
    />,
  );
  fireEvent.change(screen.getByPlaceholderText(/Deficit deadlift/), {
    target: { value: 'Catalog variation' },
  });
  const pattern = screen.getAllByRole('combobox')[0]!;
  fireEvent.change(pattern, { target: { value: 'HINGE' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Inspect a muscle' }), {
    target: { value: 'hamstrings' },
  });
  fireEvent.change(screen.getAllByRole('combobox').at(-1)!, { target: { value: 'PRIMARY' } });
  fireEvent.change(screen.getByLabelText('Choose an MP4 video'), {
    target: { files: [new File(['sample'], 'good.mp4', { type: 'video/mp4' })] },
  });
  fireEvent.change(pattern, { target: { value: 'OTHER' } });
  expect(screen.getByRole('button', { name: 'Create catalog exercise' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Create catalog exercise' }));
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(save.mock.calls[0]![1]).toBeUndefined();
  view.unmount();
});
