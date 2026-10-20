import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { authApi } from '@/features/auth/api/authApi';
import { ROUTES } from '@/shared/config/constants';
import { errorMessage } from '@/shared/lib/errorMessage';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z
  .object({
    password: z.string().min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const emailParam = searchParams.get('email') ?? '';
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    document.title = 'Đặt lại mật khẩu — FIT AI';
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (!token || !emailParam) {
      toast.error('Liên kết không đầy đủ thông tin hoặc đã hết hạn.');
      return;
    }
    try {
      await authApi.resetPassword({
        email: emailParam,
        resetToken: token,
        newPassword: values.password,
      });
      setDone(true);
      toast.success('Đặt lại mật khẩu thành công!');
    } catch (err: unknown) {
      setError('root', { message: errorMessage(err) || 'Không thể đặt lại mật khẩu.' });
    }
  });

  if (!token || !emailParam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-4 text-center">
          <CardHeader>
            <CardTitle>Yêu cầu mã xác thực OTP</CardTitle>
            <CardDescription>
              Để đặt lại mật khẩu an toàn, vui lòng yêu cầu mã OTP gửi về email của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to={ROUTES.public.forgotPassword}>Đến trang nhận mã OTP</Link>
            </Button>
            <Link
              to={ROUTES.public.login}
              className="block text-xs text-muted-foreground hover:underline"
            >
              Quay lại Đăng nhập
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Đặt lại mật khẩu mới</CardTitle>
          <CardDescription>Tài khoản: {emailParam}</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-4 py-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <p className="text-sm font-medium text-foreground">
                Mật khẩu đã được cập nhật thành công!
              </p>
              <Button className="w-full" onClick={() => navigate(ROUTES.public.login)}>
                Đăng nhập ngay
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password')}
                    className="pr-10"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    className="pr-10"
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {errors.root && <p className="text-xs text-destructive">{errors.root.message}</p>}

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                <Sparkles size={16} />
                {isSubmitting ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
