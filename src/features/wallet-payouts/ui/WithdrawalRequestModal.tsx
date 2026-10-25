import { AlertCircle, Building, CheckCircle2, CreditCard, Lock, User } from 'lucide-react';
import { useState } from 'react';

import { walletApi } from '../api/walletApi';
import { POPULAR_BANKS, type WalletDto, type WithdrawalRequestDto } from '../model/types';

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

interface WithdrawalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletDto;
  onSuccess: (request: WithdrawalRequestDto) => void;
}

const QUICK_AMOUNTS = [
  { label: '500.000 đ', value: 500_000 },
  { label: '1.000.000 đ', value: 1_000_000 },
  { label: '2.000.000 đ', value: 2_000_000 },
  { label: '5.000.000 đ', value: 5_000_000 },
];

export function WithdrawalRequestModal({
  isOpen,
  onClose,
  wallet,
  onSuccess,
}: WithdrawalRequestModalProps) {
  const [bankCode, setBankCode] = useState('VCB');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [amountStr, setAmountStr] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (raw: string) => {
    const numeric = raw.replace(/\D/g, '');
    const num = Number(numeric) || 0;
    setAmount(num);
    setAmountStr(numeric ? new Intl.NumberFormat('vi-VN').format(num) : '');
    setError(null);
  };

  const handleQuickSelect = (val: number) => {
    const clamped = Math.min(val, wallet.availableBalance);
    setAmount(clamped);
    setAmountStr(new Intl.NumberFormat('vi-VN').format(clamped));
    setError(null);
  };

  const handleSelectMax = () => {
    handleQuickSelect(wallet.availableBalance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Vui lòng nhập số tiền rút hợp lệ.');
      return;
    }

    if (amount > wallet.availableBalance) {
      setError('Số tiền rút không được vượt quá số dư khả dụng.');
      return;
    }

    if (!accountNumber.trim()) {
      setError('Vui lòng nhập số tài khoản ngân hàng.');
      return;
    }

    if (!accountHolder.trim()) {
      setError('Vui lòng nhập tên chủ tài khoản ngân hàng.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await walletApi.requestWithdrawal({
        walletId: wallet.id,
        amount,
        bankCode,
        bankAccountNumber: accountNumber.trim(),
        bankAccountHolder: accountHolder.trim().toUpperCase(),
        idempotencyKey: `wdr-ui-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      });

      onSuccess(res);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi yêu cầu rút tiền.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatVnd = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Building className="h-5 w-5 text-primary" />
            Yêu cầu rút tiền về ngân hàng
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Tiền sẽ được tạm giữ từ số dư khả dụng và phát lệnh chuyển khoản 24/7 sau khi phê duyệt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Bank Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="bankSelect" className="text-xs font-semibold">
              Ngân hàng thụ hưởng
            </Label>
            <Select
              id="bankSelect"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full"
            >
              {POPULAR_BANKS.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  [{bank.code}] {bank.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Account Number & Holder */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="accountNumber"
                className="flex items-center gap-1 text-xs font-semibold"
              >
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                Số tài khoản
              </Label>
              <Input
                id="accountNumber"
                placeholder="VD: 19036789..."
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="accountHolder"
                className="flex items-center gap-1 text-xs font-semibold"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Chủ tài khoản (Không dấu)
              </Label>
              <Input
                id="accountHolder"
                placeholder="VD: NGUYEN VAN A"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* Amount input & Quick chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount" className="text-xs font-semibold">
                Số tiền rút (VND)
              </Label>
              <span className="text-xs text-muted-foreground">
                Khả dụng:{' '}
                <strong className="text-foreground">{formatVnd(wallet.availableBalance)}</strong>
              </span>
            </div>

            <div className="relative">
              <Input
                id="amount"
                type="text"
                placeholder="0"
                value={amountStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isSubmitting}
                className="pr-12 text-lg font-bold text-primary"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                VND
              </span>
            </div>

            {/* Quick select pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_AMOUNTS.map((q) => (
                <Button
                  key={q.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full px-2.5 py-0 text-xs"
                  disabled={q.value > wallet.availableBalance || isSubmitting}
                  onClick={() => handleQuickSelect(q.value)}
                >
                  {q.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-full border-primary/50 px-2.5 py-0 text-xs font-semibold text-primary"
                disabled={wallet.availableBalance <= 0 || isSubmitting}
                onClick={handleSelectMax}
              >
                Rút tất cả
              </Button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Phí giao dịch nền tảng</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Miễn phí (0 đ)
              </span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-semibold">
              <span>Thực nhận về tài khoản</span>
              <span className="font-bold text-primary">{formatVnd(amount)}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3 shrink-0 text-amber-500" />
              <span>
                Số tiền này sẽ được khóa ngay lập tức và bảo lưu trong suốt quy trình xử lý.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || amount <= 0 || amount > wallet.availableBalance}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? 'Đang gửi...' : 'Xác nhận rút tiền'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
