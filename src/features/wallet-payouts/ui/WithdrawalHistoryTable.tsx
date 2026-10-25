import { AlertTriangle, CheckCircle, Clock, ExternalLink, RefreshCw, XCircle } from 'lucide-react';

import type { WithdrawalRequestDto, WithdrawalStatus } from '../model/types';

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

interface WithdrawalHistoryTableProps {
  withdrawals: WithdrawalRequestDto[];
  isLoading?: boolean;
}

export function WithdrawalHistoryTable({
  withdrawals,
  isLoading = false,
}: WithdrawalHistoryTableProps) {
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

  const renderStatusBadge = (status: WithdrawalStatus, reason?: string | null) => {
    switch (status) {
      case 'PendingApproval':
        return (
          <Badge
            variant="neutral"
            className="gap-1 border-amber-500/30 bg-amber-500/10 font-normal text-amber-600 dark:text-amber-400"
          >
            <Clock className="h-3 w-3" />
            Chờ duyệt
          </Badge>
        );
      case 'Approved':
        return (
          <Badge
            variant="neutral"
            className="gap-1 border-blue-500/30 bg-blue-500/10 font-normal text-blue-600 dark:text-blue-400"
          >
            <CheckCircle className="h-3 w-3" />
            Đã duyệt
          </Badge>
        );
      case 'Processing':
        return (
          <Badge
            variant="neutral"
            className="animate-pulse gap-1 border-sky-300 bg-sky-50 font-normal text-sky-600 dark:border-sky-800 dark:bg-sky-950/40"
          >
            <RefreshCw className="h-3 w-3 animate-spin" />
            Đang chuyển tiền...
          </Badge>
        );
      case 'Success':
        return (
          <Badge
            variant="neutral"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 font-normal text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle className="h-3 w-3" />
            Thành công
          </Badge>
        );
      case 'Failed':
        return (
          <Badge variant="destructive" className="gap-1 font-normal" title={reason ?? undefined}>
            <AlertTriangle className="h-3 w-3" />
            Thất bại
          </Badge>
        );
      case 'Rejected':
        return (
          <Badge variant="destructive" className="gap-1 font-normal" title={reason ?? undefined}>
            <XCircle className="h-3 w-3" />
            Đã từ chối
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin text-primary" />
        Đang tải lịch sử rút tiền...
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 py-12 text-center">
        <Clock className="mb-2 h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm font-medium text-foreground">Chưa có yêu cầu rút tiền nào</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Khi bạn gửi yêu cầu rút tiền về tài khoản ngân hàng, thông tin và tiến trình đồng bộ sẽ
          hiển thị tại đây.
        </p>
      </div>
    );
  }

  return (
    <TableContainer className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã yêu cầu</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Ngân hàng nhận</TableHead>
            <TableHead className="text-right">Số tiền rút</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Mã giao dịch Gateway</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.map((item) => (
            <TableRow key={item.id} className="transition-colors hover:bg-muted/40">
              <TableCell className="font-mono text-xs font-semibold text-primary">
                {item.requestNumber}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(item.createdAtUtc)}
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  <span className="font-semibold text-foreground">
                    [{item.bankCode}] {item.bankAccountNumber}
                  </span>
                  <div className="text-[11px] uppercase text-muted-foreground">
                    {item.bankAccountHolder}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right text-xs font-semibold text-foreground">
                {formatVnd(item.amount)}
              </TableCell>
              <TableCell>
                <div>
                  {renderStatusBadge(item.status, item.failureReason)}
                  {item.failureReason && (
                    <p
                      className="mt-0.5 max-w-xs truncate text-[11px] text-destructive"
                      title={item.failureReason}
                    >
                      Lý do: {item.failureReason}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {item.gatewayTransactionId ? (
                  <span className="flex items-center gap-1">
                    {item.gatewayTransactionId}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </span>
                ) : (
                  <span className="text-muted-foreground/60">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
