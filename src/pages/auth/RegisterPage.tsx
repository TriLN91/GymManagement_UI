import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { AuthLayout } from './components/AuthLayout';

import { useRegister } from '@/features/auth/model/useAuth';
import { ValidationError } from '@/shared/api/errorTypes';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const schema = z
  .object({
    email: z.string().email('Email không hợp lệ.'),
    // Backend policy (RegisterRequestDto): 6-128 characters.
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự.')
      .max(128, 'Mật khẩu tối đa 128 ký tự.'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp.',
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
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    document.title = `${t('auth:register.title')} — FIT AI`;
  }, [t]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Mocking fullName as it's required by backend but not in the new design
      await register.mutateAsync({
        email: values.email,
        password: values.password,
        fullName: 'New User',
      });
      void navigate(ROUTES.member.root, { replace: true });
    } catch (error) {
      if (error instanceof ValidationError) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if ((field === 'email' || field === 'password') && messages[0]) {
            setError(field, { message: messages[0] });
          }
        }
        if (error.message) setError('root', { message: error.message });
        return;
      }
      setError('root', { message: t('auth:errors.somethingWentWrong') });
    }
  });

  return (
    <AuthLayout>
      <div className="flex w-full flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex items-center font-syne text-4xl font-bold text-forest">
            FIT<span className="relative -top-2 align-top text-sm">®</span>
          </div>
          <h1 className="mb-2 font-syne text-4xl font-bold text-forest">Bắt Đầu.</h1>
          <p className="text-sm font-medium text-forest/70">
            Chọn vai trò của bạn trong hệ sinh thái FIT®.
          </p>
        </div>

        <div className="mb-8 flex w-full flex-col gap-3">
          <button
            onClick={() => setRole('member')}
            className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${role === 'member' ? 'border-forest bg-forest/5' : 'border-forest/20 hover:border-forest/40'}`}
          >
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-forest">Người tập (Member)</span>
              <span className="text-xs text-forest/60">
                Tập luyện với AI, theo dõi chỉ số cơ thể và nhận tư vấn dinh dưỡng.
              </span>
            </div>
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${role === 'member' ? 'border-forest bg-forest' : 'border-forest/30'}`}
            >
              {role === 'member' && <div className="h-2 w-2 rounded-full bg-white"></div>}
            </div>
          </button>

          <button
            onClick={() => setRole('pt')}
            className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${role === 'pt' ? 'border-forest bg-forest/5' : 'border-forest/20 hover:border-forest/40'}`}
          >
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-forest">Huấn Luyện Viên (Trainer)</span>
              <span className="text-xs text-forest/60">
                Quản lý học viên, xây dựng giáo án, theo dõi tiến độ tập luyện của học viên.
              </span>
            </div>
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${role === 'pt' ? 'border-forest bg-forest' : 'border-forest/30'}`}
            >
              {role === 'pt' && <div className="h-2 w-2 rounded-full bg-white"></div>}
            </div>
          </button>

          <button
            onClick={() => setRole('gym_admin')}
            className={`flex items-center justify-between rounded-xl border p-4 transition-colors ${role === 'gym_admin' ? 'border-forest bg-forest/5' : 'border-forest/20 hover:border-forest/40'}`}
          >
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-forest">Chủ Phòng (Gym Admin)</span>
              <span className="text-xs text-forest/60">
                Quản lý doanh thu, nhân sự, thiết bị và các chiến dịch marketing.
              </span>
            </div>
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${role === 'gym_admin' ? 'border-forest bg-forest' : 'border-forest/30'}`}
            >
              {role === 'gym_admin' && <div className="h-2 w-2 rounded-full bg-white"></div>}
            </div>
          </button>
        </div>

        <form onSubmit={onSubmit} className="w-full space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-forest"
            >
              Email đăng ký
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...registerField('email')}
              className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
              placeholder="email@gmail.com"
            />
            {errors.email ? (
              <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-forest"
            >
              Mật khẩu khởi tạo
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...registerField('password')}
              className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
              placeholder="Tối thiểu 6 ký tự"
            />
            {errors.password ? (
              <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-bold uppercase tracking-wider text-forest"
            >
              Nhập lại mật khẩu
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...registerField('confirmPassword')}
              className="h-12 border-forest/20 bg-transparent text-forest focus-visible:ring-forest"
              placeholder="Nhập lại mật khẩu"
            />
            {errors.confirmPassword ? (
              <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="mt-2 text-center text-xs font-medium text-red-500" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <Button
            type="submit"
            className="mt-6 h-12 w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90"
            disabled={register.isPending}
          >
            Tiếp tục tạo tài khoản &rarr;
          </Button>

          <div className="w-full pt-6 text-center">
            <p className="mb-6 text-[10px] font-medium text-forest/60">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Link to="#" className="underline hover:text-forest">
                Điều khoản Dịch vụ
              </Link>{' '}
              và{' '}
              <Link to="#" className="underline hover:text-forest">
                Chính sách Bảo mật
              </Link>{' '}
              của FIT®.
            </p>
            <Link
              to={ROUTES.public.login}
              className="text-xs font-medium text-forest/60 transition-colors hover:text-forest"
            >
              Đã có tài khoản? <span className="font-bold text-forest">Đăng nhập</span>
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
