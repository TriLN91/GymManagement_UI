import { act, render, screen } from '@testing-library/react';
import type * as Router from 'react-router-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useGymOwnerTrainingStore } from '@/features/gym-owner-training/model/useGymOwnerTrainingStore';
import { GymOwnerTrainerDetailPage } from '@/features/gym-owner-training/ui/TrainerPages';
import { gymOffers } from '@/features/marketplace/model/marketplaceData';
import { useMarketplaceStore } from '@/features/marketplace/model/useMarketplaceStore';
import { MarketplaceCheckoutPage } from '@/features/marketplace/ui/MarketplacePages';
import i18n from '@/i18n';

// Retain the missing-data render so the same mounted component receives its data later.
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof Router>()),
  Navigate: () => null,
}));

describe('data transitions preserve React hook order', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    useGymOwnerTrainingStore.getState().reset();
    useMarketplaceStore.getState().clearSelection();
  });

  it('checkout can receive and lose its selection without remounting', () => {
    render(
      <MemoryRouter>
        <MarketplaceCheckoutPage />
      </MemoryRouter>,
    );
    const offer = gymOffers.find((item) => item.published)!;
    act(() => useMarketplaceStore.getState().selectGymOffer(offer.id));
    expect(screen.getByRole('button', { name: 'Confirm payment' })).toBeInTheDocument();
    act(() => useMarketplaceStore.getState().clearSelection());
    expect(screen.queryByRole('button', { name: 'Confirm payment' })).not.toBeInTheDocument();
  });

  it('trainer detail can load after its missing-data render', async () => {
    const trainer = useGymOwnerTrainingStore.getState().trainers[0]!;
    await act(() => useGymOwnerTrainingStore.setState({ trainers: [] }));
    render(
      <MemoryRouter initialEntries={['/trainers/' + trainer.id]}>
        <Routes>
          <Route path="/trainers/:trainerId" element={<GymOwnerTrainerDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await act(() => useGymOwnerTrainingStore.setState({ trainers: [trainer] }));
    expect(screen.getByRole('heading', { name: trainer.fullName })).toBeInTheDocument();
  });
});
