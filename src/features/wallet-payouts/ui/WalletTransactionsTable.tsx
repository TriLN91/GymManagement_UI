import { ArrowDownLeft, ArrowUpRight, Lock, RefreshCw, Unlock } from 'lucide-react';

import type { WalletTransactionDto, WalletTransactionType } from '../model/types';

import { Badge } from '@/shared/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

interface WalletTransactionsTableProps {
  transactions: WalletTransactionDto[];
  isLoading?: boolean;
}

export function WalletTransactionsTable({
  transactions,
  isLoading = false,
}: WalletTransactionsTableProps) {
  const formatVnd = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTypeBadge = (type: WalletTransactionType) => {
    switch (type) {
      case 'SettlementDeposit':
        return (
          <Badge
            variant="neutral"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 font-normal text-emerald-600 dark:text-emerald-400"
          >
            <ArrowDownLeft className="h-3 w-3" />
            Doanh thu đối soát
          </Badge>
        );
      case 'CommissionDeposit':
        return (
          <Badge
            variant="neutral"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 font-normal text-emerald-600 dark:text-emerald-400"
          >
            <ArrowDownLeft className="h-3 w-3" />
            Hoa hồng PT
          </Badge>
        );
      case 'WithdrawalLock':
        return (
          <Badge
            variant="neutral"
            className="gap-1 border-amber-500/30 bg-amber-500/10 font-normal text-amber-600 dark:text-amber-400"
          >
            <Lock className="h-3 w-3" />
            Tạm giữ rút tiền
          </Badge>
        );
      case 'WithdrawalUnlock':
        return (
          <Badge
            variant="neutral"
            className="gap-1 border-sky-500/30 bg-sky-500/10 font-normal text-sky-600 dark:text-sky-400"
          >
            <Unlock className="h-3 w-3" />
            Hoàn trả tạm giữ
          </Badge>
        );
      case 'WithdrawalDeduct':
        return (
          <Badge variant="destructive" className="gap-1 font-normal">
            <ArrowUpRight className="h-3 w-3" />
            Rút tiền thành công
          </Badge>
        );
      case 'ManualAdjustment':
        return <Badge variant="neutral">Điều chỉnh số dư</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-primary" />
        Đang tải sổ cái biến động...
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 py-12 text-center">
        <RefreshCw className="mb-2 h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm font-medium text-foreground">Chưa có giao dịch biến động nào</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Mọi khoản ghi có đối soát hoặc khóa tiền rút sẽ được kiểm toán minh bạch trong sổ cái này.
        </p>
      </div>
    );
  }

  return (
    <TableContainer className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Loại giao dịch</TableHead>
            <TableHead>Diễn giải</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead className="text-right">Số dư khả dụng sau GD</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => {
            const isPositive = t.amount > 0;
            return (
              <TableRow key={t.id} className="transition-colors hover:bg-muted/40">
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(t.createdAtUtc)}
                </TableCell>
                <TableCell>{renderTypeBadge(t.type)}</TableCell>
                <TableCell className="max-w-sm text-xs text-foreground">{t.description}</TableCell>
                <TableCell
                  className={`whitespace-nowrap text-right text-xs font-semibold ${
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                  }`}
                >
                  {isPositive ? `+${formatVnd(t.amount)}` : formatVnd(t.amount)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right font-mono text-xs text-muted-foreground">
                  {formatVnd(t.balanceAfter)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
