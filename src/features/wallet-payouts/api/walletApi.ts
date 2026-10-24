import type {
  CreateWithdrawalRequestDto,
  WalletDto,
  WalletTransactionDto,
  WithdrawalRequestDto,
  WithdrawalStatus,
} from '../model/types';

import { apiGet, apiPost } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const walletApi = {
  getMyWallet: (): Promise<WalletDto> => {
    return apiGet<WalletDto>(ENDPOINTS.wallets.me);
  },

  getWalletById: (id: string): Promise<WalletDto> => {
    return apiGet<WalletDto>(ENDPOINTS.wallets.byId(id));
  },

  getTransactions: (walletId: string, page = 1, pageSize = 50): Promise<WalletTransactionDto[]> => {
    return apiGet<WalletTransactionDto[]>(ENDPOINTS.wallets.transactions(walletId, page, pageSize));
  },

  requestWithdrawal: (dto: CreateWithdrawalRequestDto): Promise<WithdrawalRequestDto> => {
    return apiPost<WithdrawalRequestDto, CreateWithdrawalRequestDto>(
      ENDPOINTS.withdrawals.request,
      dto,
    );
  },

  getMyWithdrawals: (): Promise<WithdrawalRequestDto[]> => {
    return apiGet<WithdrawalRequestDto[]>(ENDPOINTS.withdrawals.myRequests);
  },

  getAllWithdrawals: (params?: {
    walletId?: string;
    status?: WithdrawalStatus;
  }): Promise<WithdrawalRequestDto[]> => {
    const statusMap: Record<WithdrawalStatus, number> = {
      PendingApproval: 1,
      Approved: 2,
      Processing: 3,
      Success: 4,
      Failed: 5,
      Rejected: 6,
    };
    return apiGet<WithdrawalRequestDto[]>(
      ENDPOINTS.withdrawals.list({
        walletId: params?.walletId,
        status: params?.status ? statusMap[params.status] : undefined,
      }),
    );
  },

  getWithdrawalById: (id: string): Promise<WithdrawalRequestDto> => {
    return apiGet<WithdrawalRequestDto>(ENDPOINTS.withdrawals.byId(id));
  },

  approveWithdrawal: (id: string): Promise<WithdrawalRequestDto> => {
    return apiPost<WithdrawalRequestDto>(ENDPOINTS.withdrawals.approve(id));
  },

  rejectWithdrawal: (id: string, reason: string): Promise<WithdrawalRequestDto> => {
    return apiPost<WithdrawalRequestDto, { reason: string }>(ENDPOINTS.withdrawals.reject(id), {
      reason,
    });
  },

  dispatchPayout: (id: string): Promise<WithdrawalRequestDto> => {
    return apiPost<WithdrawalRequestDto>(ENDPOINTS.withdrawals.dispatch(id));
  },

  reconcilePayouts: (olderThanMinutes = 15): Promise<number> => {
    return apiPost<number>(ENDPOINTS.withdrawals.reconcile(olderThanMinutes));
  },
};
