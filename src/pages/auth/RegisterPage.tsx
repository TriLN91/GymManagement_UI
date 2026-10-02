import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { AuthLayout } from './components/AuthLayout';

import { useRegister } from '@/features/auth/model/useAuth';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z.object({
  email: z.string().email('invalid'),
  password: z.string().min(8, 'min8'),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const register = useRegister();
  const [role, setRole] = useState<'member' | 'pt' | 'gym_admin'>('member');

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    document.title = `${t('auth:register.title')} — FIT AI`;
  }, [t]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Mocking fullName as it's required by backend but not in the new design
      await register.mutateAsync({ ...values, fullName: 'New User' });
      void navigate(ROUTES.member.root, { replace: true });
    } catch {
      setError('root', { message: t('auth:errors.somethingWentWrong') });
    }
  });

  return (
    <AuthLayout>
      <div className="w-full flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="font-syne text-4xl font-bold text-forest flex items-center mb-4">
            FIT<span className="text-sm align-top relative -top-2">®</span>
          </div>
          <h1 className="font-syne text-4xl font-bold text-forest mb-2">Bắt Đầu.</h1>
          <p className="text-forest/70 text-sm font-medium">Chọn vai trò của bạn trong hệ sinh thái FIT®.</p>
        </div>

        <div className="w-full flex flex-col gap-3 mb-8">
          <button 
            onClick={() => setRole('member')}
            className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${role === 'member' ? 'border-mint bg-mint/5' : 'border-forest/20 hover:border-forest/40'}`}
          >
            <div className="flex flex-col text-left">
              <span className="font-bold text-forest text-sm">Người tập (Member)</span>
              <span className="text-xs text-forest/60">Tập luyện với AI, theo dõi chỉ số cơ thể và nhận tư vấn dinh dưỡng.</span>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${role === 'member' ? 'border-mint bg-mint text-forest' : 'border-forest/30'}`}>
              {role === 'member' && <div className="w-2 h-2 rounded-full bg-forest"></div>}
            </div>
          </button>

          <button 
            onClick={() => setRole('pt')}
            className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${role === 'pt' ? 'border-mint bg-mint/5' : 'border-forest/20 hover:border-forest/40'}`}
          >
            <div className="flex flex-col text-left">
              <span className="font-bold text-forest text-sm">Huấn Luyện Viên (Trainer)</span>
              <span className="text-xs text-forest/60">Quản lý học viên, xây dựng giáo án, theo dõi tiến độ tập luyện của học viên.</span>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${role === 'pt' ? 'border-mint bg-mint text-forest' : 'border-forest/30'}`}>
              {role === 'pt' && <div className="w-2 h-2 rounded-full bg-forest"></div>}
            </div>
          </button>

          <button 
            onClick={() => setRole('gym_admin')}
            className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${role === 'gym_admin' ? 'border-mint bg-mint/5' : 'border-forest/20 hover:border-forest/40'}`}
          >
            <div className="flex flex-col text-left">
              <span className="font-bold text-forest text-sm">Chủ Phòng (Gym Admin)</span>
              <span className="text-xs text-forest/60">Quản lý doanh thu, nhân sự, thiết bị và các chiến dịch marketing.</span>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${role === 'gym_admin' ? 'border-mint bg-mint text-forest' : 'border-forest/30'}`}>
              {role === 'gym_admin' && <div className="w-2 h-2 rounded-full bg-forest"></div>}
            </div>
          </button>
        </div>

        <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-forest uppercase tracking-wider">Email đăng ký</Label>
            <Input id="email" type="email" autoComplete="email" {...registerField('email')} className="bg-transparent border-forest/20 focus-visible:ring-forest text-forest h-12" placeholder="email@gmail.com" />
            {errors.email ? (
              <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold text-forest uppercase tracking-wider">Mật khẩu khởi tạo</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...registerField('password')}
              className="bg-transparent border-forest/20 focus-visible:ring-forest text-forest h-12"
              placeholder="Tối thiểu 8 ký tự"
            />
            {errors.password ? (
              <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="text-xs text-red-500 font-medium text-center mt-2" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <Button type="submit" className="w-full bg-mint text-forest hover:bg-mint/90 rounded-full font-bold h-12 mt-6" disabled={register.isPending}>
            Tiếp tục tạo tài khoản &rarr;
          </Button>
          
          <div className="pt-6 w-full text-center">
            <p className="text-[10px] text-forest/60 font-medium mb-6">Bằng việc đăng ký, bạn đồng ý với <Link to="#" className="underline hover:text-forest">Điều khoản Dịch vụ</Link> và <Link to="#" className="underline hover:text-forest">Chính sách Bảo mật</Link> của FIT®.</p>
            <Link to={ROUTES.public.login} className="text-xs text-forest/60 hover:text-forest transition-colors font-medium">
               Đã có tài khoản? <span className="font-bold text-forest">Đăng nhập</span>
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
