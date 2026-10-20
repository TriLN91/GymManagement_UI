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
      navigate(ROUTES.public.login);
    }
  };

  return (
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
        onClick={handleLoginClick}
      >
        Đăng nhập ngay
      </Button>
    </div>
  );
}
