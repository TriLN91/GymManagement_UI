import { LogOut } from 'lucide-react';
import { Suspense, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';
import { Skeleton } from '@/shared/ui/skeleton';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

export interface NavItem {
  to?: string;
  labelKey: string;
  children?: NavItem[];
  pillActive?: boolean;
  activePaths?: string[];
}

interface PortalLayoutProps {
  titleKey: string;
  nav: ReadonlyArray<NavItem>;
  children?: ReactNode;
}

function NavItemLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const { t } = useTranslation();
  const location = useLocation();

  if (item.children) {
    const isChildActive = item.children.some(
      (child) => child.to && location.pathname.startsWith(child.to),
    );
    const isExpanded = isChildActive; // Auto expand if child is active

    return (
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            'px-3 py-2 text-sm font-medium',
            isExpanded ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {t(item.labelKey, { ns: 'common' })}
        </div>
        <div className="flex flex-col gap-1 pl-4">
          {item.children.map((child, idx) => (
            <NavItemLink key={idx} item={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  }

  if (!item.to) return null;

  return (
    <NavLink
      end={
        item.to === ROUTES.member.root ||
        item.to === ROUTES.pt.root ||
        item.to === ROUTES.pt.profile ||
        item.to === ROUTES.admin.root ||
        item.to === ROUTES.superadmin.root
      }
      to={item.to}
      className={({ isActive }) => {
        const isExplicitlyActive = item.activePaths?.some(
          (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
        );
        const active = isActive || isExplicitlyActive;
        return cn(
          'block px-3 py-2 text-sm transition-colors',
          item.pillActive
            ? active
              ? 'rounded-full bg-[#A7F0DD] font-bold text-[#345C32]'
              : 'rounded-full text-muted-foreground hover:bg-[#A7F0DD]/50 hover:text-[#345C32]'
            : active
              ? 'rounded-md bg-accent font-medium text-accent-foreground'
              : 'rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        );
      }}
    >
      {t(item.labelKey, { ns: 'common' })}
    </NavLink>
  );
}

export function PortalLayout({ titleKey, nav }: PortalLayoutProps) {
  // Title and nav keys are written as plain keys inside the `common` namespace
  // (e.g. "portals.member"), so we use a single useTranslation hook.
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useLogout();
  const userFullName = useAuthStore((s) => s.user?.fullName);

  const onLogout = () => {
    logout.mutate();
    void navigate(ROUTES.public.login, { replace: true });
  };

  return (
    <div className="portal-shell min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <h1 className="text-base font-semibold">{t(titleKey, { ns: 'common' })}</h1>

        <div className="flex items-center gap-2">
          {userFullName ? (
            <span className="hidden text-sm text-muted-foreground md:inline">{userFullName}</span>
          ) : null}

          <LanguageSwitcher />
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            aria-label={t('signOut', { ns: 'common' })}
            onClick={onLogout}
            disabled={logout.isPending}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="container flex gap-6 py-6">
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="flex flex-col gap-1">
            {nav.map((item, idx) => (
              <NavItemLink key={idx} item={item} />
            ))}
          </nav>
        </aside>

        <main className="portal-content min-w-0 flex-1">
          <Suspense
            fallback={
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
