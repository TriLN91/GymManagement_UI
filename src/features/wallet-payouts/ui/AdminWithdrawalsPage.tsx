import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Landmark,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { walletApi } from '../api/walletApi';
import type { WithdrawalRequestDto, WithdrawalStatus } from '../model/types';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { WorkspacePage } from '@/shared/ui/workspace';

export function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequestDto[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);

  // Reject dialog state
  const [rejectItem, setRejectItem] = useState<WithdrawalRequestDto | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam = filterStatus !== 'ALL' ? (filterStatus as WithdrawalStatus) : undefined;
      const data = await walletApi.getAllWithdrawals({ status: statusParam });
      setWithdrawals(data);
    } catch (err) {
      console.error('Failed to load withdrawals', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      await walletApi.approveWithdrawal(id);
      await loadData();
    } catch (err) {
      console.error('Approve failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDispatch = async (id: string) => {
    setActionLoadingId(id);
    try {
      await walletApi.dispatchPayout(id);
      await loadData();
    } catch (err) {
      console.error('Dispatch failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectItem || !rejectReason.trim()) return;
    setActionLoadingId(rejectItem.id);
    try {
      await walletApi.rejectWithdrawal(rejectItem.id, rejectReason.trim());
      setRejectItem(null);
      setRejectReason('');
      await loadData();
    } catch (err) {
      console.error('Reject failed', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReconcile = async () => {
    setIsReconciling(true);
    setReconcileResult(null);
    try {
      const count = await walletApi.reconcilePayouts(15);
      setReconcileResult(`Đối soát thành công ${count} lệnh rút tiền.`);
      await loadData();
    } catch (_err) {
      setReconcileResult('Đối soát thất bại.');
    } finally {
      setIsReconciling(false);
    }
  };

  const formatVnd = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('vi-VN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <WorkspacePage width="wide" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
            <Landmark className="h-6 w-6 text-primary" />
            Quản trị Lệnh Rút tiền Toàn Sàn (Payouts)
          </h1>
          <p className="text-sm text-muted-foreground">
            Phê duyệt, phát lệnh chuyển khoản ngân hàng và kiểm soát đối soát đồng bộ 2 chiều.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={handleReconcile}
            disabled={isReconciling}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'Đang đối soát...' : 'Đối soát chủ động (Poller)'}
          </Button>
        </div>
      </div>

      {reconcileResult && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{reconcileResult}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">Lọc theo trạng thái:</span>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-48 text-xs"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PendingApproval">Chờ duyệt (PendingApproval)</option>
          <option value="Approved">Đã duyệt (Approved)</option>
          <option value="Processing">Đang xử lý (Processing)</option>
          <option value="Success">Thành công (Success)</option>
          <option value="Failed">Thất bại (Failed)</option>
          <option value="Rejected">Đã từ chối (Rejected)</option>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin text-primary" />
          Đang tải danh sách lệnh rút tiền...
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 py-12 text-center">
          <Clock className="mb-2 h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm font-medium">Không có lệnh rút tiền nào thỏa mãn điều kiện lọc.</p>
        </div>
      ) : (
        <TableContainer className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lệnh</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tài khoản nhận</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Mã Gateway</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((item) => {
                const isItemBusy = actionLoadingId === item.id;
                return (
                  <TableRow key={item.id} className="hover:bg-muted/40">
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
                      {item.status === 'Success' && (
                        <Badge
                          variant="neutral"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        >
                          {item.status}
                        </Badge>
                      )}
                      {item.status === 'Processing' && (
                        <Badge
                          variant="neutral"
                          className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        >
                          {item.status}
                        </Badge>
                      )}
                      {item.status === 'Approved' && (
                        <Badge
                          variant="neutral"
                          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        >
                          {item.status}
                        </Badge>
                      )}
                      {item.status === 'PendingApproval' && (
                        <Badge
                          variant="neutral"
                          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        >
                          {item.status}
                        </Badge>
                      )}
                      {(item.status === 'Rejected' || item.status === 'Failed') && (
                        <Badge variant="destructive">{item.status}</Badge>
                      )}
                      {item.failureReason && (
                        <p
                          className="mt-0.5 max-w-xs truncate text-[11px] text-destructive"
                          title={item.failureReason}
                        >
                          {item.failureReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.gatewayTransactionId ?? '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'PendingApproval' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 gap-1 bg-emerald-600 px-2.5 text-xs text-white hover:bg-emerald-700"
                              onClick={() => void handleApprove(item.id)}
                              disabled={isItemBusy}
                            >
                              <CheckCircle className="h-3 w-3" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1 border-destructive/30 px-2.5 text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setRejectItem(item);
                                setRejectReason('');
                              }}
                              disabled={isItemBusy}
                            >
                              <XCircle className="h-3 w-3" />
                              Từ chối
                            </Button>
                          </>
                        )}

                        {item.status === 'Approved' && (
                          <Button
                            size="sm"
                            className="h-7 gap-1 bg-primary px-2.5 text-xs text-primary-foreground"
                            onClick={() => void handleDispatch(item.id)}
                            disabled={isItemBusy}
                          >
                            <Play className="h-3 w-3" />
                            Phát lệnh Payout
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reject Dialog */}
      {rejectItem && (
        <Dialog open={true} onOpenChange={(open) => !open && setRejectItem(null)}>
          <DialogContent className="max-w-md p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Từ chối yêu cầu rút tiền {rejectItem.requestNumber}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Tiền tạm giữ ({formatVnd(rejectItem.amount)}) sẽ được hoàn trả lập tức về số dư khả
                dụng của đối tác.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <Label htmlFor="rejectReason" className="text-xs font-semibold">
                Lý do từ chối (Ghi rõ cho đối tác):
              </Label>
              <Input
                id="rejectReason"
                placeholder="VD: Số tài khoản không trùng tên chủ sở hữu phòng gym..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setRejectItem(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleRejectConfirm()}
                disabled={!rejectReason.trim()}
              >
                Xác nhận từ chối & Hoàn tiền
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </WorkspacePage>
  );
}
