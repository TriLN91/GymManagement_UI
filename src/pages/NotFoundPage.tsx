import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { portalForRole } from '@/features/auth/model/loginDestination';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <h1 className="text-3xl font-bold">{t('page.notFoundTitle', { ns: 'errors' })}</h1>
      <p className="text-muted-foreground">{t('page.notFoundBody', { ns: 'errors' })}</p>
      <Button asChild>
        <Link to={user ? portalForRole(user.roles) : ROUTES.public.landing} replace>
          {t('page.goHome', { ns: 'errors' })}
        </Link>
      </Button>
    </div>
  );
}
