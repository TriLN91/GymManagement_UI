import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { portalForRole } from '@/features/auth/model/loginDestination';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function ForbiddenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const home = user ? portalForRole(user.roles) : ROUTES.public.landing;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <h1 className="text-3xl font-bold">{t('page.forbiddenTitle', { ns: 'errors' })}</h1>
      <p className="text-muted-foreground">{t('page.forbiddenBody', { ns: 'errors' })}</p>
      <Button asChild>
        <Link to={home} replace>
          {t('page.goHome', { ns: 'errors' })}
        </Link>
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          if ((window.history.state as { idx?: number } | null)?.idx) void navigate(-1);
          else void navigate(home, { replace: true });
        }}
      >
        {t('page.goBack', { ns: 'errors' })}
      </Button>
    </div>
  );
}
