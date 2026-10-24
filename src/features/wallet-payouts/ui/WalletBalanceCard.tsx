import { ArrowUpRight, Eye, EyeOff, Lock, RefreshCw, ShieldCheck, Wallet } from 'lucide-react';
import { useState } from 'react';

import type { WalletDto } from '../model/types';

import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

interface WalletBalanceCardProps {
  wallet: WalletDto;
  onOpenWithdrawalModal: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function WalletBalanceCard({
  wallet,
  onOpenWithdrawalModal,
  onRefresh,
  isRefreshing = false,
}: WalletBalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formatVnd = (amount: number) => {
    if (!showBalance) return '•••••••• đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Card className="relative overflow-hidden border border-border/80 bg-gradient-to-br from-card via-card/95 to-accent/5 p-6 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Ví doanh thu đối soát
                </span>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={showBalance ? 'Ẩn số dư' : 'Hiện số dư'}
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground/80">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Bảo vệ bởi cơ chế Sổ cái kép & Chống rút trùng
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Số dư khả dụng
              </p>
              <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatVnd(wallet.availableBalance)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Sẵn sàng để rút về tài khoản ngân hàng
              </p>
            </div>

            <div>
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3 text-amber-500" />
                Số dư tạm giữ
              </p>
              <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {formatVnd(wallet.lockedBalance)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Đang xử lý trong các lệnh rút tiền
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tổng số dư
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatVnd(wallet.totalBalance)}
              </p>
              <p className="text-[11px] text-muted-foreground">Khả dụng + Tạm giữ</p>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-3 self-end md:flex-col md:self-auto">
          <Button
            size="lg"
            className="flex-1 gap-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 md:flex-none"
            disabled={wallet.availableBalance <= 0 || !wallet.isActive}
            onClick={onOpenWithdrawalModal}
          >
            <ArrowUpRight className="h-4 w-4" />
            Yêu cầu rút tiền
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Làm mới số dư
          </Button>
        </div>
      </div>
    </Card>
  );
}
