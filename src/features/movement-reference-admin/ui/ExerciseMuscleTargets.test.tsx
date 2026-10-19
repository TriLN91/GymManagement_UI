import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { expect, it, vi } from 'vitest';

import { ExerciseMuscleTargets, type TargetMuscle } from './ExerciseMuscleTargets';

import i18n from '@/i18n';

it('edits controlled target roles independently and requires a primary target', async () => {
  await i18n.changeLanguage('en');
  const changed = vi.fn();
  function Editor() {
    const [value, setValue] = useState<TargetMuscle[]>([]);
    return (
      <ExerciseMuscleTargets
        value={value}
        onChange={(next) => {
          changed(next);
          setValue(next);
        }}
      />
    );
  }
  const view = render(<Editor />);
  fireEvent.change(screen.getByRole('combobox', { name: 'Inspect a muscle' }), {
    target: { value: 'hamstrings' },
  });
  const role = screen.getAllByRole('combobox')[1]!;
  fireEvent.change(role, { target: { value: 'SECONDARY' } });
  expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one primary target.');
  fireEvent.change(role, { target: { value: 'PRIMARY' } });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(changed).toHaveBeenLastCalledWith([{ code: 'hamstrings', role: 'PRIMARY' }]);
  fireEvent.change(role, { target: { value: '' } });
  expect(changed).toHaveBeenLastCalledWith([]);
  view.unmount();
});
