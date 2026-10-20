import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { authApi } from '@/features/auth/api/authApi';
import { errorMessage } from '@/shared/lib/errorMessage';
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

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại.'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
    path: ['newPassword'],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError('');
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      setServerError(
        errorMessage(err) || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.',
      );
    }
  });

  const handleClose = () => {
    reset();
    setServerError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <KeyRound className="text-primary" size={20} />
            Đổi mật khẩu tài khoản
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Nhập mật khẩu hiện tại và thiết lập mật khẩu mới (tối thiểu 6 ký tự).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2" noValidate>
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="current-pwd" className="text-xs font-semibold">
              Mật khẩu hiện tại (*)
            </Label>
            <div className="relative">
              <Input
                id="current-pwd"
                type={showCurrentPassword ? 'text' : 'password'}
                {...register('currentPassword')}
                className="pr-10"
                placeholder="Nhập mật khẩu đang dùng"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="new-pwd" className="text-xs font-semibold">
              Mật khẩu mới (*)
            </Label>
            <div className="relative">
              <Input
                id="new-pwd"
                type={showNewPassword ? 'text' : 'password'}
                {...register('newPassword')}
                className="pr-10"
                placeholder="Tối thiểu 6 ký tự"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pwd" className="text-xs font-semibold">
              Xác nhận mật khẩu mới (*)
            </Label>
            <div className="relative">
              <Input
                id="confirm-pwd"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="pr-10"
                placeholder="Nhập lại mật khẩu mới"
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

          {serverError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
              {serverError}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={15} />
                  Đang lưu...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Cập nhật mật khẩu
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
