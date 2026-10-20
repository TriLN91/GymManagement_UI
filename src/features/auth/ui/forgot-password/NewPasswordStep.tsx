import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { authApi } from '../../api/authApi';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

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

export interface NewPasswordStepProps {
  email: string;
  resetToken: string;
  onSuccess: () => void;
}

export function NewPasswordStep({ email, resetToken, onSuccess }: NewPasswordStepProps) {
  const isSubmittingRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (isSubmittingRef.current || form.formState.isSubmitting) return;
    isSubmittingRef.current = true;
    try {
      await authApi.resetPassword({
        email,
        resetToken,
        newPassword: values.password,
      });
      onSuccess();
      toast.success('Đặt lại mật khẩu thành công!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu.';
      toast.error(message);
    } finally {
      isSubmittingRef.current = false;
    }
  });

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Mật khẩu mới
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...form.register('password')}
            className="h-12 border-input bg-background/50 pl-10 pr-10"
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
        {form.formState.errors.password && (
          <p className="text-xs font-medium text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Xác nhận mật khẩu mới
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...form.register('confirmPassword')}
            className="h-12 border-input bg-background/50 pl-10 pr-10"
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
        {form.formState.errors.confirmPassword && (
          <p className="text-xs font-medium text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="mt-6 h-12 w-full gap-2 rounded-xl bg-forest font-bold text-white shadow-md transition-all hover:bg-forest/90 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? (
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
  );
}
