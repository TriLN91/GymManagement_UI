export type WalletOwnerType = 'Gym' | 'Trainer' | 'Member';

export type WalletTransactionType =
  | 'SettlementDeposit'
  | 'CommissionDeposit'
  | 'ManualAdjustment'
  | 'WithdrawalLock'
  | 'WithdrawalUnlock'
  | 'WithdrawalDeduct';

export type WithdrawalStatus =
  'PendingApproval' | 'Approved' | 'Processing' | 'Success' | 'Failed' | 'Rejected';

export interface WalletDto {
  id: string;
  ownerType: WalletOwnerType;
  ownerId: string;
  availableBalance: number;
  lockedBalance: number;
  totalBalance: number;
  currencyCode: string;
  isActive: boolean;
}

export interface WalletTransactionDto {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAtUtc: string;
}

export interface WithdrawalRequestDto {
  id: string;
  requestNumber: string;
  walletId: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  status: WithdrawalStatus;
  gatewayTransactionId?: string | null;
  failureReason?: string | null;
  requestedByUserId?: string | null;
  approvedByUserId?: string | null;
  approvedAtUtc?: string | null;
  processedAtUtc?: string | null;
  completedAtUtc?: string | null;
  createdAtUtc: string;
}

export interface CreateWithdrawalRequestDto {
  walletId: string;
  amount: number;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  idempotencyKey?: string | null;
}

export const POPULAR_BANKS = [
  { code: 'VCB', name: 'Vietcombank - Ngân hàng Ngoại thương Việt Nam' },
  { code: 'TCB', name: 'Techcombank - Ngân hàng Kỹ thương Việt Nam' },
  { code: 'MB', name: 'MBBank - Ngân hàng Quân Đội' },
  { code: 'ACB', name: 'ACB - Ngân hàng Á Châu' },
  { code: 'BIDV', name: 'BIDV - Ngân hàng Đầu tư và Phát triển Việt Nam' },
  { code: 'VPB', name: 'VPBank - Ngân hàng Việt Nam Thịnh Vượng' },
  { code: 'VBA', name: 'Agribank - Ngân hàng Nông nghiệp Việt Nam' },
  { code: 'TPB', name: 'TPBank - Ngân hàng Tiên Phong' },
  { code: 'STB', name: 'Sacombank - Ngân hàng Sài Gòn Thương Tín' },
  { code: 'VIB', name: 'VIB - Ngân hàng Quốc Tế' },
];
