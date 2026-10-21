import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { marketplaceApi, type OrderView } from '../api/marketplaceApi';
import { useMarketplaceStore } from '../model/useMarketplaceStore';

import { MarketplacePaymentResultPage } from './MarketplacePages';

import i18n from '@/i18n';

const id = '10000000-0000-4000-8000-000000000001';
const pending: OrderView = {
  id,
  orderNumber: 'FF-PENDING',
  memberProfileId: 'member',
  gymId: 'gym',
  gymServiceAmount: 100,
  plusAmount: 0,
  totalAmount: 100,
  platformCommissionAmount: 10,
  gymPayoutAmount: 90,
  status: 'PendingPayment',
  paymentStatus: 'Pending',
  fulfillmentStatus: 'NotStarted',
  createdAtUtc: '2026-10-21T00:00:00Z',
};
const show = () =>
  render(
    <MemoryRouter initialEntries={[`/payment/${id}`]}>
      <Routes>
        <Route path="/payment/:orderId" element={<MarketplacePaymentResultPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(async () => {
  await i18n.changeLanguage('en');
  useMarketplaceStore.setState({ orders: [], selection: null });
});
afterEach(() => vi.restoreAllMocks());

it('loads a direct order URL without redirecting or claiming payment success', async () => {
  vi.spyOn(marketplaceApi, 'getOrder').mockResolvedValue(pending);
  show();
  expect(
    await screen.findByRole('heading', { name: 'Awaiting payment confirmation' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Not active')).toBeInTheDocument();
});

it('shows an API failure instead of stale local success and recovers on explicit retry', async () => {
  useMarketplaceStore.setState({
    orders: [
      {
        ...pending,
        paymentStatus: 'succeeded',
        fulfillmentStatus: 'pending_gym_confirmation',
        selection: { kind: 'gym_offer', productId: id, includePlus: false },
        paymentMethod: 'card',
        createdAt: pending.createdAtUtc,
        title: 'Stale order',
        providerName: 'Gym',
        serviceAmountVnd: 100,
        serviceDiscountVnd: 0,
        plusAmountVnd: 0,
        totalVnd: 100,
        uncoveredPlusDays: 0,
      },
    ],
  });
  const getOrder = vi
    .spyOn(marketplaceApi, 'getOrder')
    .mockRejectedValueOnce(new Error('Unavailable'))
    .mockResolvedValue(pending);
  show();
  expect(await screen.findByRole('alert')).toHaveTextContent('Payment cannot be confirmed');
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(
    await screen.findByRole('heading', { name: 'Awaiting payment confirmation' }),
  ).toBeInTheDocument();
  expect(getOrder).toHaveBeenCalledTimes(2);
});
