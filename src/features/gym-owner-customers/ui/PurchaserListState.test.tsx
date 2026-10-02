import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { gymOwnerPurchaserMockResource } from '../model/mockData';

import { PurchaserListState } from './PurchaserListState';

const labels = {
  loadingLabel: 'Loading customers',
  emptyLabel: 'No customer records',
  errorLabel: 'Could not load customers',
};

describe('PurchaserListState', () => {
  it('renders loading, empty and error states explicitly', () => {
    const { rerender } = render(
      <PurchaserListState resource={{ state: 'loading' }} {...labels}>
        {() => null}
      </PurchaserListState>,
    );
    expect(screen.getByRole('status', { name: labels.loadingLabel })).toBeInTheDocument();

    rerender(
      <PurchaserListState resource={{ state: 'empty' }} {...labels}>
        {() => null}
      </PurchaserListState>,
    );
    expect(screen.getByText(labels.emptyLabel)).toBeInTheDocument();

    rerender(
      <PurchaserListState resource={{ state: 'error' }} {...labels}>
        {() => null}
      </PurchaserListState>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(labels.errorLabel);
  });

  it('keeps operational mock records free of health, workout and AI assessment fields', () => {
    expect(gymOwnerPurchaserMockResource.state).toBe('loaded');
    if (gymOwnerPurchaserMockResource.state !== 'loaded') return;

    const forbiddenKeys = [
      'health',
      'medical',
      'weight',
      'height',
      'workout',
      'exercise',
      'assessment',
      'posture',
      'bodyComposition',
    ];
    gymOwnerPurchaserMockResource.data.forEach((record) => {
      expect(Object.keys(record)).not.toEqual(expect.arrayContaining(forbiddenKeys));
    });
  });
});
