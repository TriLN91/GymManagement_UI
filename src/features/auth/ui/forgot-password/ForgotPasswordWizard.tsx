import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { authApi } from '../../api/authApi';

import { EmailStep } from './EmailStep';
import { NewPasswordStep } from './NewPasswordStep';
import { OtpVerificationStep } from './OtpVerificationStep';
import { ResetSuccessStep } from './ResetSuccessStep';

import { errorMessage } from '@/shared/lib/errorMessage';

export type ForgotPasswordStep = 'email' | 'otp' | 'new_password' | 'success';

export interface ForgotPasswordWizardProps {
  onSuccess?: () => void;
}

export function ForgotPasswordWizard({ onSuccess }: ForgotPasswordWizardProps) {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || !email) return;
    try {
      const res = await authApi.forgotPassword(email);
      if (res?.debugOtpCode) {
        setDebugOtpCode(res.debugOtpCode);
      }
      setCooldown(60);
      toast.success('Mã OTP mới đã được gửi!');
    } catch (err: unknown) {
      toast.error(errorMessage(err) || 'Không thể gửi lại mã OTP.');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex items-center font-syne text-4xl font-extrabold tracking-tight text-forest dark:text-emerald-400">
          FIT<span className="relative -top-2 align-top text-sm">®</span> AI
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {step === 'email' && 'Quên mật khẩu'}
          {step === 'otp' && 'Xác thực mã OTP'}
          {step === 'new_password' && 'Thiết lập mật khẩu mới'}
          {step === 'success' && 'Hoàn tất đặt lại mật khẩu'}
        </h1>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          {step === 'email' && 'Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu an toàn.'}
          {step === 'otp' && `Hệ thống đã gửi mã OTP 6 số về email ${email}.`}
          {step === 'new_password' && 'Vui lòng nhập mật khẩu mới cho tài khoản của bạn.'}
          {step === 'success' && 'Tài khoản của bạn đã được cập nhật mật khẩu mới.'}
        </p>
      </div>

      {/* Step Indicator */}
      {step !== 'success' && (
        <div className="mb-6 flex w-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step === 'email'
                  ? 'bg-forest text-white dark:bg-emerald-500'
                  : 'bg-emerald-500/20 text-emerald-600'
              }`}
            >
              1
            </span>
            <span className="text-xs font-medium text-foreground">Email</span>
          </div>
          <div className="mx-2 h-0.5 flex-1 bg-muted-foreground/20" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step === 'otp'
                  ? 'bg-forest text-white dark:bg-emerald-500'
                  : step === 'new_password'
                    ? 'bg-emerald-500/20 text-emerald-600'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              2
            </span>
            <span className="text-xs font-medium text-foreground">OTP</span>
          </div>
          <div className="mx-2 h-0.5 flex-1 bg-muted-foreground/20" />
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step === 'new_password'
                  ? 'bg-forest text-white dark:bg-emerald-500'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              3
            </span>
            <span className="text-xs font-medium text-foreground">Mật khẩu</span>
          </div>
        </div>
      )}

      {/* STEP 1: ENTER EMAIL */}
      {step === 'email' && (
        <EmailStep
          onSuccess={(enteredEmail, debugCode) => {
            setEmail(enteredEmail);
            if (debugCode) {
              setDebugOtpCode(debugCode);
            }
            setCooldown(60);
            setStep('otp');
          }}
        />
      )}

      {/* STEP 2: VERIFY OTP */}
      {step === 'otp' && (
        <OtpVerificationStep
          email={email}
          debugOtpCode={debugOtpCode}
          cooldown={cooldown}
          onResendOtp={handleResendOtp}
          onBackToEmail={() => setStep('email')}
          onSuccess={(token) => {
            setResetToken(token);
            setStep('new_password');
          }}
        />
      )}

      {/* STEP 3: NEW PASSWORD */}
      {step === 'new_password' && (
        <NewPasswordStep
          email={email}
          resetToken={resetToken}
          onSuccess={() => {
            setStep('success');
            onSuccess?.();
          }}
        />
      )}

      {/* STEP 4: SUCCESS */}
      {step === 'success' && <ResetSuccessStep />}
    </div>
  );
}
