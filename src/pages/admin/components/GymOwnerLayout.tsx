import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  FileCheck2,
  KeyRound,
  Landmark,
  Languages,
  LayoutDashboard,
  LineChart,
  Loader2,
  LogOut,
  Menu,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding';
import { BRAND_MARK, ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

import '@/pages/member/components/member-layout.css';

interface OwnerNavItem {
  label: string;
  icon?: LucideIcon;
  to: string;
}

interface OwnerNavGroup {
  id:
    | 'dashboard'
    | 'profile'
    | 'trainers'
    | 'packages'
    | 'customers'
    | 'orders'
    | 'analytics'
    | 'notifications'
    | 'security'
    | 'onboarding';
  label: string;
  icon: LucideIcon;
  items: ReadonlyArray<OwnerNavItem>;
}

const END_ROUTES: ReadonlySet<string> = new Set([
  ROUTES.admin.root,
  ROUTES.admin.onboarding,
  ROUTES.admin.pts,
  ROUTES.admin.packages,
  ROUTES.admin.customers,
  ROUTES.admin.orders,
  ROUTES.admin.settlements,
  ROUTES.admin.analytics,
  ROUTES.admin.notifications,
  ROUTES.admin.accountSecurity,
]);

function matchesRoute(to: string, pathname: string) {
  if (to === ROUTES.admin.root || to === ROUTES.admin.onboarding) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function GymOwnerLayout() {
  const { i18n, t } = useTranslation(['owner', 'common']);
  const isVi = i18n.resolvedLanguage === 'vi';
  const location = useLocation();
  const status = useGymOwnerOnboardingStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navGroups = useMemo<ReadonlyArray<OwnerNavGroup>>(() => {
    const groups: OwnerNavGroup[] = [];
    if (status === 'approved') {
      groups.push({
        id: 'dashboard',
        label: t('shell.nav.dashboard'),
        icon: LayoutDashboard,
        items: [{ label: t('shell.nav.dashboardOverview'), to: ROUTES.admin.root }],
      });
      groups.push({
        id: 'profile',
        label: t('shell.nav.profile'),
        icon: Building2,
        items: [
          {
            label: t('shell.nav.profileOverview'),
            to: ROUTES.admin.profile,
            icon: Building2,
          },
          {
            label: t('shell.nav.profileBrand'),
            to: ROUTES.admin.profileBrand,
            icon: ClipboardCheck,
          },
          {
            label: t('shell.nav.profileBranches'),
            to: ROUTES.admin.profileBranches,
            icon: Circle,
          },
        ],
      });
      groups.push({
        id: 'trainers',
        label: t('shell.nav.trainers'),
        icon: UsersRound,
        items: [
          {
            label: t('shell.nav.trainerList'),
            to: ROUTES.admin.pts,
            icon: UsersRound,
          },
          {
            label: t('shell.nav.assignmentExceptions'),
            to: ROUTES.admin.trainerAssignments,
            icon: ClipboardCheck,
          },
        ],
      });
      groups.push({
        id: 'packages',
        label: t('shell.nav.packages'),
        icon: PackageCheck,
        items: [
          {
            label: t('shell.nav.packageManagement'),
            to: ROUTES.admin.packages,
            icon: PackageCheck,
          },
        ],
      });
      groups.push({
        id: 'customers',
        label: t('shell.nav.customers'),
        icon: ReceiptText,
        items: [
          {
            label: t('shell.nav.customerList'),
            to: ROUTES.admin.customers,
            icon: ReceiptText,
          },
        ],
      });
      groups.push({
        id: 'orders',
        label: t('shell.nav.orders'),
        icon: Landmark,
        items: [
          {
            label: t('shell.nav.orderList'),
            to: ROUTES.admin.orders,
            icon: ReceiptText,
          },
          {
            label: t('shell.nav.settlements'),
            to: ROUTES.admin.settlements,
            icon: Landmark,
          },
        ],
      });
      groups.push({
        id: 'analytics',
        label: t('shell.nav.analytics'),
        icon: LineChart,
        items: [
          {
            label: t('shell.nav.analyticsOps'),
            to: ROUTES.admin.analytics,
            icon: LineChart,
          },
        ],
      });
      groups.push({
        id: 'notifications',
        label: t('shell.nav.notifications'),
        icon: Bell,
        items: [
          {
            label: t('shell.nav.notificationsSystem'),
            to: ROUTES.admin.notifications,
            icon: Bell,
          },
        ],
      });
      groups.push({
        id: 'security',
        label: t('shell.nav.security'),
        icon: KeyRound,
        items: [
          {
            label: t('shell.nav.securityVerification'),
            to: ROUTES.admin.accountSecurity,
            icon: ShieldCheck,
          },
        ],
      });
    }
    groups.push({
      id: 'onboarding',
      label: t('shell.nav.onboarding'),
      icon: ClipboardCheck,
      items: [
        {
          label: t('shell.nav.onboardingOverview'),
          to: ROUTES.admin.onboarding,
          icon: ClipboardCheck,
        },
        {
          label: t('shell.nav.onboardingBrand'),
          to: ROUTES.admin.onboardingProfile,
          icon: Building2,
        },
        {
          label: t('shell.nav.onboardingLicense'),
          to: ROUTES.admin.onboardingLicense,
          icon: FileCheck2,
        },
        {
          label: t('shell.nav.onboardingReview'),
          to: ROUTES.admin.onboardingReview,
          icon: ShieldCheck,
        },
        {
          label: t('shell.nav.onboardingStatus'),
          to: ROUTES.admin.onboardingStatus,
          icon: Circle,
        },
      ],
    });
    return groups;
  }, [t, status]);

  const initialGroup =
    navGroups.find((group) => group.items.some((item) => matchesRoute(item.to, location.pathname)))
      ?.id ?? 'onboarding';
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<OwnerNavGroup['id']>>(
    () => new Set([initialGroup]),
  );

  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => matchesRoute(item.to, location.pathname)),
    )?.id;
    if (!activeGroup) return;

    setExpandedGroups((current) => {
      if (current.has(activeGroup)) return current;
      return new Set([...current, activeGroup]);
    });
  }, [location.pathname, navGroups]);

  const userName = user?.fullName || t('shell.role');
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'G';
  const ownerLabel = t('shell.role');
  const workspaceLabel = t('shell.workspace');

  const toggleGroup = (groupId: OwnerNavGroup['id']) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const handleLogout = () => {
    void logout.mutate();
    void navigate(ROUTES.public.login, { replace: true });
  };

  const toggleLanguage = () => {
    void i18n.changeLanguage(isVi ? 'en' : 'vi');
  };

  const mobileItems = navGroups
    .flatMap((group) => {
      const [item] = group.items;
      return item ? [item] : [];
    })
    .slice(0, 4);

  return (
    <div className="member-shell owner-shell">
      <header className="member-mobile-header">
        <button
          type="button"
          className="member-icon-button"
          aria-label={isMenuOpen ? t('shell.closeMenu') : t('shell.openMenu')}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <div className="member-brand">
          <span>{BRAND_MARK}</span>
          <small>{ownerLabel}</small>
        </div>
        <div className="member-avatar" aria-hidden="true">
          {userInitial}
        </div>
      </header>

      {isMenuOpen ? (
        <button
          type="button"
          className="member-sidebar-overlay"
          aria-label={t('shell.closeMenu')}
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}

      <aside className={cn('member-sidebar', isMenuOpen && 'is-open')}>
        <div className="member-sidebar__brand">
          <div className="member-brand">
            <span>{BRAND_MARK}</span>
            <small>{ownerLabel}</small>
          </div>
          <span>{workspaceLabel}</span>
        </div>

        <nav className="member-sidebar__nav" aria-label={workspaceLabel}>
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroups.has(group.id);
            const hasActiveChild = group.items.some((item) =>
              matchesRoute(item.to, location.pathname),
            );
            return (
              <div className="member-nav-group" key={group.id}>
                <button
                  type="button"
                  className={cn('member-nav-group__trigger', hasActiveChild && 'has-active-child')}
                  aria-expanded={isExpanded}
                  aria-controls={`owner-nav-${group.id}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>
                    <GroupIcon aria-hidden="true" size={17} strokeWidth={1.8} />
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn(isExpanded && 'is-rotated')}
                    aria-hidden="true"
                    size={16}
                  />
                </button>
                <div
                  className={cn('member-nav-children', isExpanded && 'is-expanded')}
                  id={`owner-nav-${group.id}`}
                >
                  {group.items.map((item) => {
                    const ItemIcon = item.icon ?? Circle;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={END_ROUTES.has(item.to)}
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => cn('member-nav-link', isActive && 'is-active')}
                      >
                        <ItemIcon aria-hidden="true" size={13} strokeWidth={1.8} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="member-sidebar__footer">
          <div className="member-profile-summary">
            <div className="member-avatar">{userInitial}</div>
            <div>
              <strong>{userName}</strong>
              <span>{ownerLabel}</span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} aria-label={t('common:signOut')}>
            <LogOut aria-hidden="true" size={16} />
          </button>
        </div>
      </aside>

      <div className="member-main">
        <header className="member-topbar">
          <div className="member-topbar__context">
            <span>{BRAND_MARK}</span>
            <span>/</span>
            <strong>{workspaceLabel}</strong>
          </div>
          <div className="member-topbar__actions">
            <button type="button" onClick={toggleLanguage} className="member-language-button">
              <Languages aria-hidden="true" size={16} />
              <span>{t('shell.switchLanguage')}</span>
            </button>
            <div className="member-topbar__profile">
              <div>
                <strong>{userName}</strong>
                <span>{ownerLabel}</span>
              </div>
              <div className="member-avatar">
                <UserRound aria-hidden="true" size={17} />
              </div>
            </div>
          </div>
        </header>

        <main className="member-content">
          <Suspense
            fallback={
              <div className="member-route-loading">
                <Loader2 aria-hidden="true" size={28} />
                <span>{t('common:loading')}</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      <nav className="member-bottom-nav" aria-label={workspaceLabel}>
        {mobileItems.map((item) => {
          const Icon = item.icon ?? Circle;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={END_ROUTES.has(item.to)}
              className={({ isActive }) => cn(isActive && 'is-active')}
            >
              <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
