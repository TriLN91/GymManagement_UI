import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { expect, it } from 'vitest';

import { ExerciseMuscleTargets, type TargetMuscle } from './ExerciseMuscleTargets';

import i18n from '@/i18n';
it('selects canonical groups directly, changes roles and explains constraints', async () => {
  await i18n.changeLanguage('en');
  function Editor() {
    const [value, setValue] = useState<TargetMuscle[]>([]);
    return <ExerciseMuscleTargets value={value} onChange={setValue} />;
  }
  const view = render(<Editor />);
  fireEvent.click(screen.getByRole('button', { name: 'Hamstrings' }));
  expect(screen.getByRole('button', { name: 'Hamstrings' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const role = screen.getByRole('combobox', { name: 'Role for Hamstrings' });
  fireEvent.change(role, { target: { value: 'SECONDARY' } });
  expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one primary');
  fireEvent.change(role, { target: { value: 'PRIMARY' } });
  fireEvent.click(screen.getByRole('button', { name: 'Gluteus maximus' }));
  fireEvent.click(screen.getByRole('button', { name: 'Lower back' }));
  expect(screen.getByText(/Target muscles · 3\/3/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Biceps' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Limit: 3 groups');
  fireEvent.change(screen.getByRole('combobox', { name: 'Role for Gluteus maximus' }), {
    target: { value: 'PRIMARY' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: 'Role for Lower back' }), {
    target: { value: 'PRIMARY' },
  });
  expect(screen.getByRole('alert')).toHaveTextContent('at most 2 primary');
  fireEvent.click(screen.getByRole('button', { name: 'Remove Hamstrings' }));
  expect(screen.getByRole('button', { name: 'Hamstrings' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  view.unmount();
});
