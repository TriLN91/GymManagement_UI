import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { AuthLayout } from './components/AuthLayout';

import { authApi } from '@/features/auth/api/authApi';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const emailSchema = z.object({
  email: z.string().email('Email không hợp lệ. Vui lòng nhập đúng định dạng.'),
});
type EmailFormValues = z.infer<typeof emailSchema>;

const passwordSchema = z
  .object({
    password: z.string().min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard steps: 'email' -> 'otp' -> 'new_password' -> 'success'
  const [step, setStep] = useState<'email' | 'otp' | 'new_password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);

  // Timers and UI states
  const [cooldown, setCooldown] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forms
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    document.title = 'Quên mật khẩu & Xác thực OTP — FIT AI';
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Submit Email to generate & send OTP
  const onSendEmail = emailForm.handleSubmit(async (values) => {
    try {
      const res = await authApi.forgotPassword(values.email);
      setEmail(values.email);
      if (res?.debugOtpCode) {
        setDebugOtpCode(res.debugOtpCode);
      }
      setCooldown(60);
      setStep('otp');
      toast.success(res?.message || 'Mã OTP đã được gửi về email của bạn!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    }
  });

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
    } catch (err: any) {
      toast.error(err?.message || 'Không thể gửi lại mã OTP.');
    }
  };

  // Step 2: Verify OTP
  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError('Vui lòng nhập đầy đủ mã OTP 6 số.');
      return;
    }
    setOtpError('');
    setIsVerifyingOtp(true);
    try {
      const res = await authApi.verifyOtp({ email, otpCode: otpCode.trim() });
      if (res?.isValid && res.resetToken) {
        setResetToken(res.resetToken);
        setStep('new_password');
        toast.success(res.message || 'Xác thực OTP thành công!');
      } else {
        setOtpError(res?.message || 'Mã OTP không hợp lệ.');
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Step 3: Reset Password
  const onResetPassword = passwordForm.handleSubmit(async (values) => {
    try {
      await authApi.resetPassword({
        email,
        resetToken,
        newPassword: values.password,
      });
      setStep('success');
      toast.success('Đặt lại mật khẩu thành công!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đặt lại mật khẩu.');
    }
  });

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center max-w-md mx-auto">
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
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {step === 'email' && 'Nhập email đã đăng ký để nhận mã OTP khôi phục mật khẩu an toàn.'}
            {step === 'otp' && `Hệ thống đã gửi mã OTP 6 số về email ${email}.`}
            {step === 'new_password' && 'Vui lòng nhập mật khẩu mới cho tài khoản của bạn.'}
            {step === 'success' && 'Tài khoản của bạn đã được cập nhật mật khẩu mới.'}
          </p>
        </div>

        {/* Step Indicator */}
        {step !== 'success' && (
          <div className="w-full flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === 'email'
                    ? 'bg-forest text-white dark:bg-emerald-500'
                    : 'bg-emerald-500/20 text-emerald-600'
                }`}
              >
                1
              </span>
              <span className="text-xs font-medium text-foreground">Email</span>
            </div>
            <div className="flex-1 h-0.5 mx-2 bg-muted-foreground/20" />
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
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
            <div className="flex-1 h-0.5 mx-2 bg-muted-foreground/20" />
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
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
          <form onSubmit={onSendEmail} className="w-full space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Email đăng ký tài khoản
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...emailForm.register('email')}
                  className="h-12 pl-10 border-input bg-background/50 focus-visible:ring-forest dark:focus-visible:ring-emerald-500"
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
              </div>
              {emailForm.formState.errors.email && (
                <p className="text-xs font-medium text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="mt-6 h-12 w-full rounded-xl bg-forest dark:bg-emerald-600 font-bold text-white hover:bg-forest/90 dark:hover:bg-emerald-700 shadow-md transition-all gap-2"
              disabled={emailForm.formState.isSubmitting}
            >
              {emailForm.formState.isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Đang tạo mã OTP...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Gửi mã xác thực OTP
                </>
              )}
            </Button>

            <div className="w-full pt-4 text-center">
              <Link
                to={ROUTES.public.login}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} />
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'otp' && (
          <form onSubmit={onVerifyOtp} className="w-full space-y-5">
            <div className="p-3 rounded-xl bg-muted/60 border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Gửi đến: <strong className="text-foreground">{email}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-primary hover:underline font-semibold"
              >
                Đổi email
              </button>
            </div>

            {/* Dev Quick-Fill Helper */}
            {debugOtpCode && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-mono">
                  ⚡ Mã OTP Dev: <strong>{debugOtpCode}</strong>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700 px-2.5 py-0 border-transparent"
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
              <Label htmlFor="otpCode" className="text-xs font-bold uppercase tracking-wider text-foreground text-center block">
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
                  className="h-14 text-center font-mono text-2xl tracking-[0.5em] font-extrabold border-input bg-background/50 focus-visible:ring-forest dark:focus-visible:ring-emerald-500"
                  placeholder="••••••"
                  autoFocus
                />
              </div>
              {otpError && (
                <p className="text-xs font-medium text-destructive flex items-center gap-1.5 justify-center">
                  <AlertCircle size={14} />
                  {otpError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-forest dark:bg-emerald-600 font-bold text-white hover:bg-forest/90 dark:hover:bg-emerald-700 shadow-md transition-all gap-2"
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
                onClick={() => setStep('email')}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                Quay lại
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0}
                className="text-xs font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {cooldown > 0 ? `Gửi lại mã sau (${cooldown}s)` : 'Chưa nhận được mã? Gửi lại'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 'new_password' && (
          <form onSubmit={onResetPassword} className="w-full space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Mật khẩu mới
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...passwordForm.register('password')}
                  className="h-12 pl-10 pr-10 border-input bg-background/50"
                  placeholder="Tối thiểu 6 ký tự"
                />
                <Lock className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordForm.formState.errors.password && (
                <p className="text-xs font-medium text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-foreground">
                Xác nhận mật khẩu mới
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...passwordForm.register('confirmPassword')}
                  className="h-12 pl-10 pr-10 border-input bg-background/50"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <Lock className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="mt-6 h-12 w-full rounded-xl bg-forest dark:bg-emerald-600 font-bold text-white hover:bg-forest/90 dark:hover:bg-emerald-700 shadow-md transition-all gap-2"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  Đang lưu mật khẩu...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Thiết lập mật khẩu mới
                </>
              )}
            </Button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && (
          <div className="w-full text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                Cập nhật mật khẩu thành công!
              </h2>
              <p className="text-xs text-muted-foreground">
                Mật khẩu mới của bạn đã được lưu an toàn. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.
              </p>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-forest dark:bg-emerald-600 font-bold text-white hover:bg-forest/90 dark:hover:bg-emerald-700 shadow-md"
              onClick={() => navigate(ROUTES.public.login)}
            >
              Đăng nhập ngay
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

