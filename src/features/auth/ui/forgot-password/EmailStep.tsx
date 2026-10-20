import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { authApi } from '../../api/authApi';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const emailSchema = z.object({
  email: z.string().email('Email không hợp lệ. Vui lòng nhập đúng định dạng.'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export interface EmailStepProps {
  onSuccess: (email: string, debugOtpCode?: string | null) => void;
}

export function EmailStep({ onSuccess }: EmailStepProps) {
  const isSubmittingRef = useRef(false);
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (isSubmittingRef.current || form.formState.isSubmitting) return;
    isSubmittingRef.current = true;
    try {
      const res = await authApi.forgotPassword(values.email);
      onSuccess(values.email, res?.debugOtpCode ?? null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể gửi mã OTP. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      isSubmittingRef.current = false;
    }
  });

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Email đăng ký tài khoản
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register('email')}
            className="h-12 border-input bg-background/50 pl-10 focus-visible:ring-forest dark:focus-visible:ring-emerald-500"
            placeholder="name@example.com"
          />
          <Mail className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
        </div>
        {form.formState.errors.email && (
          <p className="text-xs font-medium text-destructive">
            {form.formState.errors.email.message}
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
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Quay lại Đăng nhập
        </Link>
      </div>
    </form>
  );
}
