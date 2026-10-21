import { AlertCircle, ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { authApi } from '../../api/authApi';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export interface OtpVerificationStepProps {
  email: string;
  debugOtpCode?: string | null;
  cooldown: number;
  onResendOtp: () => Promise<void>;
  onBackToEmail: () => void;
  onSuccess: (resetToken: string) => void;
}

export function OtpVerificationStep({
  email,
  debugOtpCode,
  cooldown,
  onResendOtp,
  onBackToEmail,
  onSuccess,
}: OtpVerificationStepProps) {
  const isSubmittingRef = useRef(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isVerifyingOtp) return;
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError('Vui lòng nhập đầy đủ mã OTP 6 số.');
      return;
    }
    isSubmittingRef.current = true;
    setOtpError('');
    setIsVerifyingOtp(true);
    try {
      const res = await authApi.verifyOtp({ email, otpCode: otpCode.trim() });
      if (res?.isValid && res.resetToken) {
        onSuccess(res.resetToken);
        toast.success(res.message || 'Xác thực OTP thành công!');
      } else {
        setOtpError(res?.message || 'Mã OTP không hợp lệ.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Mã OTP không chính xác hoặc đã hết hạn.';
      setOtpError(message);
    } finally {
      isSubmittingRef.current = false;
      setIsVerifyingOtp(false);
    }
  };

  return (
    <form onSubmit={onVerifyOtp} className="w-full space-y-5">
      <div className="flex items-center justify-between rounded-xl border bg-muted/60 p-3 text-xs">
        <span className="text-muted-foreground">
          Gửi đến: <strong className="text-foreground">{email}</strong>
        </span>
        <button
          type="button"
          onClick={onBackToEmail}
          className="font-semibold text-primary hover:underline"
        >
          Đổi email
        </button>
      </div>

      {/* Dev Quick-Fill Helper */}
      {debugOtpCode && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <span className="font-mono text-xs text-emerald-800 dark:text-emerald-300">
            ⚡ Mã OTP Dev: <strong>{debugOtpCode}</strong>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 border-transparent bg-emerald-600 px-2.5 py-0 text-xs text-white hover:bg-emerald-700"
            onClick={() => {
              setOtpCode(debugOtpCode);
              setOtpError('');
            }}
          >
            Điền nhanh
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label
          htmlFor="otpCode"
          className="block text-center text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Nhập mã OTP (6 chữ số)
        </Label>
        <div className="relative">
          <Input
            id="otpCode"
            type="text"
            maxLength={6}
            value={otpCode}
            onChange={(e) => {
              setOtpCode(e.target.value.replace(/\D/g, ''));
              setOtpError('');
            }}
            className="h-14 border-input bg-background/50 text-center font-mono text-2xl font-extrabold tracking-[0.5em] focus-visible:ring-forest dark:focus-visible:ring-emerald-500"
            placeholder="••••••"
            autoFocus
          />
        </div>
        {otpError && (
          <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-destructive">
            <AlertCircle size={14} />
            {otpError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-12 w-full gap-2 rounded-xl bg-forest font-bold text-white shadow-md transition-all hover:bg-forest/90 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        disabled={isVerifyingOtp}
      >
        {isVerifyingOtp ? (
          <>
            <RefreshCw className="animate-spin" size={16} />
            Đang xác thực...
          </>
        ) : (
          <>
            <KeyRound size={18} />
            Xác nhận mã OTP
          </>
        )}
      </Button>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToEmail}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={13} />
          Quay lại
        </button>

        <button
          type="button"
          onClick={onResendOtp}
          disabled={cooldown > 0}
          className="text-xs font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {cooldown > 0 ? `Gửi lại mã sau (${cooldown}s)` : 'Chưa nhận được mã? Gửi lại'}
        </button>
      </div>
    </form>
  );
}
