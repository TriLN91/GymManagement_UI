import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { portalForRole } from '@/features/auth/model/loginDestination';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { env } from '@/shared/config/env';

export function LegacyCommerceBoundary({
  children,
  sample = false,
}: PropsWithChildren<{ sample?: boolean }>) {
  const { i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  if (env.VITE_ENABLE_LEGACY_AI_COMMERCE) return children;
  const vi = i18n.resolvedLanguage === 'vi';
  return (
    <section className="space-y-4 rounded-xl border border-border p-6">
      <h1 className="text-2xl font-semibold">
        {sample
          ? vi
            ? 'Báo cáo mẫu đã tạm ẩn'
            : 'Sample reporting is unavailable'
          : vi
            ? 'Tính năng mua bán cũ đã tạm ẩn'
            : 'Legacy commerce is unavailable'}
      </h1>
      <p>
        {sample
          ? vi
            ? 'Trang này dùng số liệu minh họa, chưa kết nối báo cáo tài khoản thực.'
            : 'This view uses illustrative data and is not connected to live account reporting.'
          : vi
            ? 'Mua thẻ phòng tập và gói PT diễn ra trực tiếp với Gym. Trang này không thực hiện thanh toán hoặc kích hoạt quyền lợi.'
            : 'Arrange gym memberships and PT packages directly with the Gym. This page does not process payments or activate benefits.'}
      </p>
      <Link className="underline" to={portalForRole(user?.roles ?? [])}>
        {vi ? 'Về không gian làm việc' : 'Return to your workspace'}
      </Link>
    </section>
  );
}
