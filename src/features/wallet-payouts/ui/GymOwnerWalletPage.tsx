import { ArrowLeftRight, History, Landmark, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { walletApi } from '../api/walletApi';
import type { WalletDto, WalletTransactionDto, WithdrawalRequestDto } from '../model/types';

import { WalletBalanceCard } from './WalletBalanceCard';
import { WalletTransactionsTable } from './WalletTransactionsTable';
import { WithdrawalHistoryTable } from './WithdrawalHistoryTable';
import { WithdrawalRequestModal } from './WithdrawalRequestModal';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { WorkspacePage } from '@/shared/ui/workspace';

export function GymOwnerWalletPage() {
  const [wallet, setWallet] = useState<WalletDto | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequestDto[]>([]);
  const [transactions, setTransactions] = useState<WalletTransactionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'transactions'>('withdrawals');

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const w = await walletApi.getMyWallet();
      setWallet(w);

      const [wList, tList] = await Promise.all([
        walletApi.getMyWithdrawals(),
        walletApi.getTransactions(w.id, 1, 50),
      ]);

      setWithdrawals(wList);
      setTransactions(tList);
    } catch (err) {
      console.error('Failed to load wallet data', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleWithdrawalSuccess = (_newRequest: WithdrawalRequestDto) => {
    void loadData(true);
  };

  if (isLoading && !wallet) {
    return (
      <WorkspacePage width="wide">
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin text-primary" />
          Đang tải dữ liệu ví tiền...
        </div>
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage width="wide" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Landmark className="h-6 w-6 text-primary" />
          Ví tiền & Quản lý Rút tiền
        </h1>
        <p className="text-sm text-muted-foreground">
          Theo dõi số dư doanh thu đối soát, thực hiện rút tiền về ngân hàng và kiểm toán biến động
          số dư.
        </p>
      </div>

      {/* Balance Card */}
      {wallet && (
        <WalletBalanceCard
          wallet={wallet}
          onOpenWithdrawalModal={() => setIsModalOpen(true)}
          onRefresh={() => void loadData(true)}
          isRefreshing={isRefreshing}
        />
      )}

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'withdrawals' | 'transactions')}
        className="w-full space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-2">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="withdrawals" className="gap-2 text-xs font-semibold">
              <History className="h-3.5 w-3.5" />
              Lịch sử rút tiền ({withdrawals.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2 text-xs font-semibold">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Sổ cái biến động số dư ({transactions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="withdrawals" className="m-0 focus-visible:outline-none">
          <WithdrawalHistoryTable withdrawals={withdrawals} isLoading={isRefreshing} />
        </TabsContent>

        <TabsContent value="transactions" className="m-0 focus-visible:outline-none">
          <WalletTransactionsTable transactions={transactions} isLoading={isRefreshing} />
        </TabsContent>
      </Tabs>

      {/* Modal */}
      {wallet && (
        <WithdrawalRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          wallet={wallet}
          onSuccess={handleWithdrawalSuccess}
        />
      )}
    </WorkspacePage>
  );
}
