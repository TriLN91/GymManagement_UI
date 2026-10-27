import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';

import { LegacyCommerceBoundary } from './LegacyCommerceBoundary';

import i18n from '@/i18n';

it('sample-report deep links explain unavailable data without rendering invented totals', async () => {
  await i18n.changeLanguage('en');
  render(
    <MemoryRouter>
      <LegacyCommerceBoundary sample>
        <p>Invented revenue total</p>
      </LegacyCommerceBoundary>
    </MemoryRouter>,
  );
  expect(
    screen.getByRole('heading', { name: 'Sample reporting is unavailable' }),
  ).toBeInTheDocument();
  expect(screen.queryByText('Invented revenue total')).not.toBeInTheDocument();
});
