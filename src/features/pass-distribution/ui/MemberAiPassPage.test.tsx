import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { passDistributionApi } from '../api/passDistributionApi';
import type { ActiveMemberAiPassResponse, DistributionOfferDto } from '../types';

import { MemberAiPassPage } from './MemberAiPassPage';

import { ApiError } from '@/shared/api/errorTypes';

vi.mock('../api/passDistributionApi', () => ({
  passDistributionApi: {
    getCurrentPass: vi.fn(),
    getMemberOffers: vi.fn(),
    acceptOffer: vi.fn(),
    declineOffer: vi.fn(),
  },
}));
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const offer: DistributionOfferDto = {
  id: 'offer-1',
  gymId: 'gym-1',
  gymName: 'Demo Gym',
  gymBranchId: null,
  branchName: null,
  distributionProgramId: null,
  programName: null,
  memberProfileId: 'member-1',
  memberFullName: 'Member',
  memberEmail: 'member@test.invalid',
  passCreditId: 'credit-1',
  passTypeId: 'type-1',
  passTypeName: 'New Pass',
  status: 'Pending',
  message: null,
  offerSentAtUtc: '2026-10-27T00:00:00Z',
  expiresAtUtc: '2099-11-10T00:00:00Z',
  respondedAtUtc: null,
  declinedReason: null,
};
const empty: ActiveMemberAiPassResponse = {
  hasActivePass: false,
  activePass: null,
  daysRemaining: 0,
};
const active: ActiveMemberAiPassResponse = {
  hasActivePass: true,
  daysRemaining: 20,
  activePass: {
    id: 'pass-1',
    memberProfileId: 'member-1',
    passTypeId: 'type-old',
    passName: 'Existing Pass',
    sourceType: 'GymDistributed',
    status: 'Active',
    startsAtUtc: '2026-10-01T00:00:00Z',
    expiresAtUtc: '2099-10-31T00:00:00Z',
    activatedAtUtc: '2026-10-01T00:00:00Z',
    snapshot: null,
  },
};

beforeEach(() => {
  vi.mocked(passDistributionApi.getCurrentPass).mockResolvedValue(empty);
  vi.mocked(passDistributionApi.getMemberOffers).mockResolvedValue([offer]);
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('shows a failed load as an error and retries rather than claiming the member has no pass', async () => {
  vi.mocked(passDistributionApi.getCurrentPass)
    .mockRejectedValueOnce(new Error('Server unavailable'))
    .mockResolvedValue(active);
  const user = userEvent.setup();
  render(<MemberAiPassPage />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
  expect(screen.queryByText('Existing Pass')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Thử lại' }));
  expect(await screen.findByText('Existing Pass')).toBeInTheDocument();
});

it('requires a fresh explicit replacement decision after a stale-pass conflict', async () => {
  const user = userEvent.setup();
  vi.mocked(passDistributionApi.getCurrentPass)
    .mockResolvedValueOnce(empty)
    .mockResolvedValue(active);
  vi.mocked(passDistributionApi.acceptOffer).mockRejectedValueOnce(
    new ApiError(409, 'Pass changed'),
  );
  render(<MemberAiPassPage />);
  await user.click(await screen.findByRole('button', { name: /Ưu đãi nhận thẻ/ }));
  await user.click(screen.getByRole('button', { name: 'Kích hoạt nhận thẻ' }));
  await user.click(screen.getByRole('button', { name: 'Kích Hoạt Ngay' }));
  const confirm = await screen.findByRole('button', { name: 'Xác Nhận & Thay Thế Thẻ' });
  expect(confirm).toBeDisabled();
  expect(passDistributionApi.acceptOffer).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole('checkbox'));
  vi.mocked(passDistributionApi.acceptOffer).mockResolvedValue({
    success: true,
    message: 'Activated',
    passId: 'new-pass',
    requiresReplacementConfirmation: false,
    currentActivePass: null,
  });
  await user.click(confirm);
  await waitFor(() =>
    expect(passDistributionApi.acceptOffer).toHaveBeenLastCalledWith('offer-1', {
      acknowledgeReplaceCurrentPass: true,
      expectedCurrentPassId: 'pass-1',
    }),
  );
});

it('does not discard the decline action after a network error', async () => {
  vi.mocked(passDistributionApi.declineOffer).mockRejectedValueOnce(
    new Error('Network unavailable'),
  );
  const user = userEvent.setup();
  render(<MemberAiPassPage />);
  await user.click(await screen.findByRole('button', { name: /Ưu đãi nhận thẻ/ }));
  await user.click(screen.getByRole('button', { name: 'Từ chối' }));
  await user.click(screen.getByRole('button', { name: 'Xác Nhận Từ Chối' }));
  await waitFor(() => expect(passDistributionApi.declineOffer).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: 'Xác Nhận Từ Chối' })).toBeEnabled();
});
