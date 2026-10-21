import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Dumbbell,
  History,
  Languages,
  LayoutDashboard,
  Library,
  ListPlus,
  Loader2,
  LogOut,
  Menu,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { marketplaceApi } from '@/features/marketplace/api/marketplaceApi';
import { NotificationBell } from '@/features/notifications';
import { useTrainerProfileStore } from '@/features/trainer-profile';
import { BRAND_MARK, ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import {
  matchesSidebarSearch,
  SidebarSearch,
  SidebarToggle,
  useSidebarCollapse,
  useSidebarFlyout,
} from '@/shared/ui/sidebar-controls';

import '@/pages/member/components/member-layout.css';

interface TrainerNavItem {
  labelKey: string;
  icon?: LucideIcon;
  to: string;
  activePaths?: ReadonlyArray<string>;
}

interface TrainerNavGroup {
  id: 'dashboard' | 'members' | 'workout' | 'history' | 'profile';
  labelKey: string;
  icon: LucideIcon;
  to?: string;
  items: ReadonlyArray<TrainerNavItem>;
}

const navGroups: ReadonlyArray<TrainerNavGroup> = [
  {
    id: 'dashboard',
    labelKey: 'trainerShell.dashboardGroup',
    icon: LayoutDashboard,
    items: [
      { labelKey: 'trainerShell.overview', to: ROUTES.pt.root, icon: LayoutDashboard },
      { labelKey: 'trainerShell.memberData', to: ROUTES.pt.memberData, icon: Activity },
    ],
  },
  {
    id: 'members',
    labelKey: 'trainerShell.membersGroup',
    icon: UsersRound,
    items: [
      { labelKey: 'trainerShell.members', to: ROUTES.pt.members, icon: UserRound },
      { labelKey: 'trainerShell.appointments', to: ROUTES.pt.appointments, icon: CalendarDays },
    ],
  },
  {
    id: 'workout',
    labelKey: 'trainerShell.workoutBuilder',
    icon: Dumbbell,
    items: [
      {
        labelKey: 'trainerShell.exerciseLibrary',
        to: ROUTES.pt.exerciseLibrary,
        icon: Library,
      },
      {
        labelKey: 'trainerShell.buildPlan',
        to: ROUTES.pt.planBuilder,
        icon: ListPlus,
      },
      { labelKey: 'trainerShell.memberWorkout', to: ROUTES.pt.memberWorkout, icon: Dumbbell },
    ],
  },
  {
    id: 'history',
    labelKey: 'trainerShell.historyGroup',
    icon: History,
    items: [
      { labelKey: 'trainerShell.coachingHistory', to: ROUTES.pt.coachingHistory, icon: History },
      { labelKey: 'trainerShell.income', to: ROUTES.pt.income, icon: CircleDollarSign },
    ],
  },
  {
    id: 'profile',
    labelKey: 'trainerShell.profileGroup',
    icon: UserRound,
    items: [
      {
        labelKey: 'trainerShell.personalProfile',
        to: ROUTES.pt.profile,
        icon: UserRound,
        activePaths: [ROUTES.pt.profileEdit],
      },
      {
        labelKey: 'trainerShell.gymInformation',
        to: ROUTES.pt.gymInfo,
        icon: Building2,
      },
    ],
  },
];

const mobileNav: ReadonlyArray<{
  id: 'dashboard' | 'members' | 'plans' | 'appointments' | 'profile';
  labelKey: string;
  icon: LucideIcon;
  to: string;
}> = [
  {
    id: 'dashboard',
    labelKey: 'trainerShell.dashboardGroup',
    icon: LayoutDashboard,
    to: ROUTES.pt.root,
  },
  {
    id: 'members',
    labelKey: 'trainerShell.membersGroup',
    icon: UsersRound,
    to: ROUTES.pt.members,
  },
  {
    id: 'plans',
    labelKey: 'trainerShell.buildPlan',
    icon: Dumbbell,
    to: ROUTES.pt.planBuilder,
  },
  {
    id: 'appointments',
    labelKey: 'trainerShell.appointments',
    icon: CalendarDays,
    to: ROUTES.pt.appointments,
  },
  {
    id: 'profile',
    labelKey: 'trainerShell.profileGroup',
    icon: UserRound,
    to: ROUTES.pt.profile,
  },
];

function matchesTrainerMobileNav(id: (typeof mobileNav)[number]['id'], pathname: string) {
  if (id === 'dashboard') return pathname === ROUTES.pt.root || pathname === ROUTES.pt.memberData;
  if (id === 'members')
    return pathname === ROUTES.pt.members || pathname.startsWith(`${ROUTES.pt.members}/`);
  if (id === 'plans') return pathname.startsWith(ROUTES.pt.workoutBuilder);
  if (id === 'appointments') return pathname === ROUTES.pt.appointments;
  return pathname.startsWith(ROUTES.pt.profile);
}

function matchesTrainerRoute(item: TrainerNavItem, pathname: string) {
  if (item.activePaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true;
  }
  if (item.to === ROUTES.pt.root || item.to === ROUTES.pt.profile) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function TrainerLayout() {
  const { i18n, t } = useTranslation('common');
  const isVi = i18n.resolvedLanguage === 'vi';
  const location = useLocation();
  const initialGroup =
    navGroups.find((group) =>
      group.items.some((item) => matchesTrainerRoute(item, location.pathname)),
    )?.id ?? 'dashboard';
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<TrainerNavGroup['id']>>(
    () => new Set([initialGroup]),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapse();
  const [sidebarQuery, setSidebarQuery] = useState('');
  const { flyout, toggleFlyout, closeFlyout } = useSidebarFlyout();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const userName = user?.fullName || 'Trainer';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'T';
  const query = sidebarQuery.trim();

  const isProfileComplete = useTrainerProfileStore((state) => state.isProfileComplete);
  const setIsProfileComplete = useTrainerProfileStore((state) => state.setIsProfileComplete);

  useEffect(() => {
    marketplaceApi
      .getTrainerProfileStatus()
      .then((status) => {
        if (status) setIsProfileComplete(status.isProfileComplete);
      })
      .catch(() => {});
  }, [setIsProfileComplete]);

  useEffect(() => {
    if (
      !isProfileComplete &&
      location.pathname !== ROUTES.pt.profileEdit &&
      location.pathname !== ROUTES.pt.profile &&
      location.pathname !== ROUTES.pt.gymInfo
    ) {
      void navigate(ROUTES.pt.profileEdit, { replace: true });
    }
  }, [isProfileComplete, location.pathname, navigate]);

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items:
        !query || matchesSidebarSearch(t(group.labelKey), query)
          ? group.items
          : group.items.filter((item) => matchesSidebarSearch(t(item.labelKey), query)),
    }))
    .filter(
      (group) =>
        group.items.length > 0 ||
        (group.to && (!query || matchesSidebarSearch(t(group.labelKey), query))),
    );

  useEffect(() => closeFlyout(), [closeFlyout, location.pathname]);

  const toggleGroup = (groupId: TrainerNavGroup['id']) => {
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
    void i18n.changeLanguage(i18n.resolvedLanguage === 'vi' ? 'en' : 'vi');
  };

  return (
    <div className={cn('member-shell trainer-shell', isSidebarCollapsed && 'is-sidebar-collapsed')}>
      <header className="member-mobile-header">
        <button
          type="button"
          className="member-icon-button"
          aria-label={isMenuOpen ? t('trainerShell.closeMenu') : t('trainerShell.openMenu')}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <div className="member-brand">
          <span>{BRAND_MARK}</span>
          <small>{t('trainerShell.trainer')}</small>
        </div>
        <div className="member-avatar" aria-hidden="true">
          {userInitial}
        </div>
      </header>

      {isMenuOpen && (
        <button
          type="button"
          className="member-sidebar-overlay"
          aria-label={t('trainerShell.closeMenu')}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside className={cn('member-sidebar', isMenuOpen && 'is-open')}>
        <div className="member-sidebar__brand">
          <div className="member-brand">
            <span>{BRAND_MARK}</span>
            <small>{t('trainerShell.trainer')}</small>
          </div>
          <span>{t('trainerShell.workspace')}</span>
          <SidebarToggle
            collapsed={isSidebarCollapsed}
            isVi={isVi}
            onToggle={() => {
              if (!isSidebarCollapsed) setSidebarQuery('');
              closeFlyout();
              setIsSidebarCollapsed((collapsed) => !collapsed);
            }}
          />
        </div>

        <nav className="member-sidebar__nav" aria-label={t('trainerShell.workspace')}>
          <SidebarSearch query={sidebarQuery} isVi={isVi} onChange={setSidebarQuery} />
          {visibleGroups.map((group) => {
            const GroupIcon = group.icon;

            // Direct link trigger for single destination items
            if (group.to && (!group.items || group.items.length === 0)) {
              const active = matchesTrainerRoute(
                { to: group.to, labelKey: group.labelKey },
                location.pathname,
              );
              return (
                <div className="member-nav-group" key={group.id}>
                  <NavLink
                    to={group.to}
                    end={group.to === ROUTES.pt.root}
                    onClick={() => {
                      setIsMenuOpen(false);
                      closeFlyout();
                    }}
                    aria-label={t(group.labelKey)}
                    title={isSidebarCollapsed ? t(group.labelKey) : undefined}
                    className={cn(
                      'member-nav-group__trigger is-direct-link',
                      active && 'is-active',
                    )}
                  >
                    <span>
                      <GroupIcon aria-hidden="true" size={20} strokeWidth={1.8} />
                      <span className="member-nav-group__label">{t(group.labelKey)}</span>
                    </span>
                  </NavLink>
                </div>
              );
            }

            const isFlyoutOpen = isSidebarCollapsed && flyout?.id === group.id;
            const isExpanded = isSidebarCollapsed
              ? isFlyoutOpen
              : Boolean(query) || expandedGroups.has(group.id);
            const hasActiveChild = group.items.some((item) =>
              matchesTrainerRoute(item, location.pathname),
            );
            return (
              <div className="member-nav-group" key={group.id}>
                <button
                  type="button"
                  className={cn(
                    'member-nav-group__trigger',
                    isExpanded && 'is-expanded',
                    hasActiveChild && 'has-active-child',
                    isFlyoutOpen && 'is-flyout-open',
                  )}
                  aria-expanded={isExpanded}
                  aria-label={t(group.labelKey)}
                  title={isSidebarCollapsed ? t(group.labelKey) : undefined}
                  aria-controls={`trainer-nav-${group.id}`}
                  onClick={(event) =>
                    isSidebarCollapsed
                      ? toggleFlyout(group.id, event.currentTarget, group.items.length)
                      : toggleGroup(group.id)
                  }
                >
                  <span>
                    <GroupIcon aria-hidden="true" size={20} strokeWidth={1.8} />
                    <span className="member-nav-group__label">{t(group.labelKey)}</span>
                  </span>
                  <ChevronDown
                    className={cn(isExpanded && 'is-rotated')}
                    aria-hidden="true"
                    size={16}
                  />
                </button>
                <div
                  className={cn(
                    'member-nav-children',
                    isExpanded && 'is-expanded',
                    isFlyoutOpen && 'is-flyout-open',
                  )}
                  id={`trainer-nav-${group.id}`}
                  style={isFlyoutOpen ? { top: flyout?.top } : undefined}
                >
                  <div className="member-nav-children__heading">{t(group.labelKey)}</div>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon ?? ClipboardList;
                    const active = matchesTrainerRoute(item, location.pathname);
                    return (
                      <NavLink
                        key={`${group.id}-${item.labelKey}`}
                        to={item.to}
                        end={item.to === ROUTES.pt.root || item.to === ROUTES.pt.profile}
                        onClick={() => {
                          setIsMenuOpen(false);
                          closeFlyout();
                        }}
                        aria-label={t(item.labelKey)}
                        title={isSidebarCollapsed ? t(item.labelKey) : undefined}
                        className={cn('member-nav-link', active && 'is-active')}
                      >
                        <ItemIcon aria-hidden="true" size={16} strokeWidth={1.8} />
                        <span>{t(item.labelKey)}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {visibleGroups.length === 0 ? (
            <p className="member-sidebar__no-results">
              {isVi ? 'Không tìm thấy mục phù hợp' : 'No matching menu items'}
            </p>
          ) : null}
        </nav>

        <div className="member-sidebar__footer">
          <div className="member-profile-summary">
            <div className="member-avatar">{userInitial}</div>
            <div>
              <strong>{userName}</strong>
              <span>{t('trainerShell.accountLabel')}</span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} aria-label={t('signOut')}>
            <LogOut aria-hidden="true" size={16} />
          </button>
        </div>
      </aside>

      <div className="member-main">
        <header className="member-topbar">
          <div className="member-topbar__context">
            <span>{BRAND_MARK}</span>
            <span>/</span>
            <strong>{t('trainerShell.context')}</strong>
          </div>
          <div className="member-topbar__actions">
            <button type="button" onClick={toggleLanguage} className="member-language-button">
              <Languages aria-hidden="true" size={16} />
              <span>{t('trainerShell.changeLanguage')}</span>
            </button>
            <NotificationBell />
            <div className="member-topbar__profile">
              <div>
                <strong>{userName}</strong>
                <span>{t('trainerShell.accountLabel')}</span>
              </div>
              <div className="member-avatar">
                <UserRound aria-hidden="true" size={17} />
              </div>
            </div>
          </div>
        </header>

        {!isProfileComplete && (
          <aside
            role="alert"
            className="flex items-center justify-between border-b border-amber-500/30 bg-amber-500/15 px-6 py-3 text-amber-900 dark:text-amber-200"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="shrink-0 text-amber-500" size={18} />
              <span>
                {isVi
                  ? 'Hồ sơ chưa hoàn thiện: Vui lòng điền đầy đủ thông tin chuyên môn trước khi nhận học viên.'
                  : 'Incomplete Profile: Please complete your profile before receiving clients.'}
              </span>
            </div>
            <NavLink
              to={ROUTES.pt.profileEdit}
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-amber-400"
            >
              {isVi ? 'Hoàn tất hồ sơ ngay' : 'Complete Profile Now'}
            </NavLink>
          </aside>
        )}

        <main className="member-content">
          <Suspense
            fallback={
              <div className="member-route-loading">
                <Loader2 aria-hidden="true" size={28} />
                <span>{t('loading')}</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      <nav className="member-bottom-nav" aria-label={t('trainerShell.workspace')}>
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={cn(matchesTrainerMobileNav(item.id, location.pathname) && 'is-active')}
            >
              <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
