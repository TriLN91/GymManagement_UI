import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export interface ResetSuccessStepProps {
  onNavigateLogin?: () => void;
}

export function ResetSuccessStep({ onNavigateLogin }: ResetSuccessStepProps) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      void navigate(ROUTES.public.login);
    }
  };

  return (
    <div className="w-full space-y-5 py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 size={36} />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground">Cập nhật mật khẩu thành công!</h2>
        <p className="text-xs text-muted-foreground">
          Mật khẩu mới của bạn đã được lưu an toàn. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ
          thống.
        </p>
      </div>

      <Button
        className="h-12 w-full rounded-xl bg-forest font-bold text-white shadow-md hover:bg-forest/90 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        onClick={handleLoginClick}
      >
        Đăng nhập ngay
      </Button>
    </div>
  );
}
