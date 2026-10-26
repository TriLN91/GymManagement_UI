import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Bot,
  CalendarDays,
  Camera,
  ChevronDown,
  ClipboardList,
  Dumbbell,
  History,
  Languages,
  LayoutDashboard,
  ListPlus,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Package,
  Play,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  Trophy,
  UserRound,
  UsersRound,
  Watch,
  X,
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { NotificationBell } from '@/features/notifications';
import { BRAND_MARK, ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import {
  matchesSidebarSearch,
  SidebarSearch,
  SidebarToggle,
  useSidebarCollapse,
  useSidebarFlyout,
} from '@/shared/ui/sidebar-controls';

import './member-layout.css';

interface MemberNavItem {
  labelKey: string;
  icon?: LucideIcon;
  to?: string;
}

interface MemberNavGroup {
  id: 'dashboard' | 'workout' | 'aiPass' | 'marketplace' | 'profile';
  labelKey: string;
  icon: LucideIcon;
  to?: string;
  items: ReadonlyArray<MemberNavItem>;
}

const navGroups: ReadonlyArray<MemberNavGroup> = [
  {
    id: 'dashboard',
    labelKey: 'memberShell.overview',
    icon: LayoutDashboard,
    to: ROUTES.member.root,
    items: [],
  },
  {
    id: 'workout',
    labelKey: 'memberShell.workoutGroup',
    icon: Dumbbell,
    items: [
      { labelKey: 'memberShell.workoutPlans', to: ROUTES.member.workout, icon: ClipboardList },
      {
        labelKey: 'memberShell.weeklySchedule',
        to: ROUTES.member.workoutSchedule,
        icon: CalendarDays,
      },
      { labelKey: 'memberShell.workoutExecution', to: ROUTES.member.workoutExecution, icon: Play },
      { labelKey: 'memberShell.workoutBuilder', to: ROUTES.member.workoutBuilder, icon: ListPlus },
      { labelKey: 'memberShell.aiAssessment', to: ROUTES.member.aiAssessment, icon: Camera },
      { labelKey: 'memberShell.assistant', to: ROUTES.member.assistant, icon: Bot },
      { labelKey: 'memberShell.progressTracking', to: ROUTES.member.progress, icon: TrendingUp },
      { labelKey: 'memberShell.achievements', to: ROUTES.member.achievements, icon: Trophy },
      { labelKey: 'memberShell.workoutHistory', to: ROUTES.member.workoutHistory, icon: History },
    ],
  },
  {
    id: 'aiPass',
    labelKey: 'memberShell.aiPass',
    icon: Sparkles,
    to: ROUTES.member.aiPass,
    items: [],
  },
  {
    id: 'marketplace',
    labelKey: 'memberShell.marketplaceGroup',
    icon: Store,
    items: [
      { labelKey: 'memberShell.findGyms', to: ROUTES.member.marketplace, icon: MapPin },
      { labelKey: 'memberShell.gymOffers', to: ROUTES.member.marketplaceOffers, icon: Tag },
      { labelKey: 'memberShell.trainers', to: ROUTES.member.marketplaceTrainers, icon: UsersRound },
      { labelKey: 'memberShell.ptPackages', to: ROUTES.member.marketplacePackages, icon: Package },
    ],
  },
  {
    id: 'profile',
    labelKey: 'memberShell.profileGroup',
    icon: UserRound,
    items: [
      { labelKey: 'memberShell.personalProfile', to: ROUTES.member.profile, icon: UserRound },
      { labelKey: 'memberShell.aiPass', to: ROUTES.member.aiPass, icon: Sparkles },
      {
        labelKey: 'memberShell.appointments',
        to: ROUTES.member.profileAppointments,
        icon: CalendarDays,
      },
      {
        labelKey: 'memberShell.assessmentHistory',
        to: ROUTES.member.profileAssessments,
        icon: Camera,
      },
      { labelKey: 'memberShell.wearables', to: ROUTES.member.profileWearables, icon: Watch },
      {
        labelKey: 'memberShell.accountSecurity',
        to: ROUTES.member.profileSecurity,
        icon: ShieldCheck,
      },
      { labelKey: 'memberShell.notifications', to: ROUTES.member.profileNotifications, icon: Bell },
    ],
  },
];

const mobileNav: ReadonlyArray<{
  id: 'dashboard' | 'workout' | 'assessment' | 'marketplace' | 'profile';
  labelKey: string;
  icon: LucideIcon;
  to: string;
}> = [
  {
    id: 'dashboard',
    labelKey: 'memberShell.dashboardGroup',
    icon: LayoutDashboard,
    to: ROUTES.member.root,
  },
  {
    id: 'workout',
    labelKey: 'memberShell.workoutGroup',
    icon: Dumbbell,
    to: ROUTES.member.workout,
  },
  {
    id: 'assessment',
    labelKey: 'memberShell.aiAssessment',
    icon: Bot,
    to: ROUTES.member.aiAssessment,
  },
  {
    id: 'marketplace',
    labelKey: 'memberShell.findGyms',
    icon: Store,
    to: ROUTES.member.marketplace,
  },
  {
    id: 'profile',
    labelKey: 'memberShell.profileGroup',
    icon: UserRound,
    to: ROUTES.member.profile,
  },
];

function matchesMemberMobileNav(id: (typeof mobileNav)[number]['id'], pathname: string) {
  if (id === 'dashboard') return pathname === ROUTES.member.root;
  if (id === 'assessment') {
    return (
      pathname === ROUTES.member.aiAssessment ||
      pathname.startsWith(`${ROUTES.member.aiAssessment}/`)
    );
  }
  if (id === 'workout') {
    return (
      pathname.startsWith(ROUTES.member.workout) && !pathname.startsWith(ROUTES.member.aiAssessment)
    );
  }
  if (id === 'marketplace') return pathname.startsWith(ROUTES.member.marketplace);
  return pathname.startsWith(ROUTES.member.profile);
}

function matchesMemberNavRoute(itemTo: string, pathname: string) {
  const exactRoutes: string[] = [
    ROUTES.member.root,
    ROUTES.member.marketplace,
    ROUTES.member.profile,
  ];
  if (exactRoutes.includes(itemTo)) return pathname === itemTo;
  return pathname === itemTo || pathname.startsWith(`${itemTo}/`);
}

export function MemberLayout() {
  const { i18n, t } = useTranslation('common');
  const isVi = i18n.resolvedLanguage === 'vi';
  const location = useLocation();
  const initialGroup =
    navGroups.find((group) =>
      group.items.some((item) => item.to && matchesMemberNavRoute(item.to, location.pathname)),
    )?.id ?? 'dashboard';
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<MemberNavGroup['id']>>(
    () => new Set([initialGroup]),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapse();
  const [sidebarQuery, setSidebarQuery] = useState('');
  const { flyout, toggleFlyout, closeFlyout } = useSidebarFlyout();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const userInitial = user?.fullName?.trim().charAt(0).toUpperCase() || 'M';
  const userName = user?.fullName || 'Member';
  const query = sidebarQuery.trim();
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

  const handleLogout = () => {
    void logout.mutate();
  };

  const toggleLanguage = () => {
    void i18n.changeLanguage(i18n.resolvedLanguage === 'vi' ? 'en' : 'vi');
  };

  const toggleGroup = (groupId: MemberNavGroup['id']) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  return (
    <div className={cn('member-shell', isSidebarCollapsed && 'is-sidebar-collapsed')}>
      <header className="member-mobile-header">
        <button
          type="button"
          className="member-icon-button"
          aria-label={isMenuOpen ? t('memberShell.closeMenu') : t('memberShell.openMenu')}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <div className="member-brand">
          <span>{BRAND_MARK}</span>
          <small>{t('memberShell.member')}</small>
        </div>
        <div className="member-avatar" aria-hidden="true">
          {userInitial}
        </div>
      </header>

      {isMenuOpen && (
        <button
          type="button"
          className="member-sidebar-overlay"
          aria-label={t('memberShell.closeMenu')}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside className={cn('member-sidebar', isMenuOpen && 'is-open')}>
        <div className="member-sidebar__brand">
          <div className="member-brand">
            <span>{BRAND_MARK}</span>
            <small>{t('memberShell.member')}</small>
          </div>
          <span>{t('memberShell.workspace')}</span>
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

        <nav className="member-sidebar__nav" aria-label={t('memberShell.workspace')}>
          <SidebarSearch query={sidebarQuery} isVi={isVi} onChange={setSidebarQuery} />
          {visibleGroups.map((group) => {
            const GroupIcon = group.icon;

            // Direct link trigger for single destination items
            if (group.to && (!group.items || group.items.length === 0)) {
              const active = matchesMemberNavRoute(group.to, location.pathname);
              return (
                <div className="member-nav-group" key={group.id}>
                  <NavLink
                    to={group.to}
                    end={group.to === ROUTES.member.root}
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
            const hasActiveChild = group.items.some(
              (item) => item.to && matchesMemberNavRoute(item.to, location.pathname),
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
                  aria-controls={`member-nav-${group.id}`}
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
                  id={`member-nav-${group.id}`}
                  style={isFlyoutOpen ? { top: flyout?.top } : undefined}
                >
                  <div className="member-nav-children__heading">{t(group.labelKey)}</div>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon ?? ClipboardList;

                    if (!item.to) {
                      return (
                        <button
                          type="button"
                          className="member-nav-link is-unavailable"
                          key={item.labelKey}
                          disabled
                          aria-label={t(item.labelKey)}
                          title={isSidebarCollapsed ? t(item.labelKey) : undefined}
                        >
                          <ItemIcon aria-hidden="true" size={16} strokeWidth={1.8} />
                          <span>{t(item.labelKey)}</span>
                          <small>{t('memberShell.soon')}</small>
                        </button>
                      );
                    }

                    return (
                      <NavLink
                        key={`${group.id}-${item.labelKey}`}
                        to={item.to}
                        end={
                          item.to === ROUTES.member.root ||
                          item.to === ROUTES.member.marketplace ||
                          item.to === ROUTES.member.profile
                        }
                        onClick={() => {
                          setIsMenuOpen(false);
                          closeFlyout();
                        }}
                        aria-label={t(item.labelKey)}
                        title={isSidebarCollapsed ? t(item.labelKey) : undefined}
                        className={({ isActive }) => cn('member-nav-link', isActive && 'is-active')}
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
              <span>{t('memberShell.tier')}</span>
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
            <strong>{t('memberShell.context')}</strong>
          </div>

          <div className="member-topbar__actions">
            <button type="button" onClick={toggleLanguage} className="member-language-button">
              <Languages aria-hidden="true" size={16} />
              <span>{t('memberShell.changeLanguage')}</span>
            </button>
            <NotificationBell />
            <div className="member-topbar__profile">
              <div>
                <strong>{userName}</strong>
                <span>{t('memberShell.tier')}</span>
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
                <span>{t('loading')}</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>

      <nav className="member-bottom-nav" aria-label={t('memberShell.workspace')}>
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={cn(matchesMemberMobileNav(item.id, location.pathname) && 'is-active')}
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
