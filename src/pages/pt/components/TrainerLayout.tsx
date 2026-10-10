import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Building2,
  CalendarDays,
  ChevronDown,
  Circle,
  CircleDollarSign,
  ClipboardList,
  Dumbbell,
  Grid2X2,
  History,
  Languages,
  LayoutDashboard,
  Library,
  Loader2,
  LogOut,
  Menu,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { BRAND_MARK, ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

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
  items: ReadonlyArray<TrainerNavItem>;
}

const navGroups: ReadonlyArray<TrainerNavGroup> = [
  {
    id: 'dashboard',
    labelKey: 'trainerShell.dashboardGroup',
    icon: LayoutDashboard,
    items: [
      { labelKey: 'trainerShell.overview', to: ROUTES.pt.root, icon: Grid2X2 },
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
        icon: ClipboardList,
      },
      { labelKey: 'trainerShell.memberWorkout', to: ROUTES.pt.memberWorkout },
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
  const location = useLocation();
  const initialGroup =
    navGroups.find((group) =>
      group.items.some((item) => matchesTrainerRoute(item, location.pathname)),
    )?.id ?? 'dashboard';
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<TrainerNavGroup['id']>>(
    () => new Set([initialGroup]),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const userName = user?.fullName || 'Trainer';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'T';

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
    <div className="member-shell trainer-shell">
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
        </div>

        <nav className="member-sidebar__nav" aria-label={t('trainerShell.workspace')}>
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroups.has(group.id);
            const hasActiveChild = group.items.some((item) =>
              matchesTrainerRoute(item, location.pathname),
            );
            return (
              <div className="member-nav-group" key={group.id}>
                <button
                  type="button"
                  className={cn('member-nav-group__trigger', hasActiveChild && 'has-active-child')}
                  aria-expanded={isExpanded}
                  aria-controls={`trainer-nav-${group.id}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>
                    <GroupIcon aria-hidden="true" size={17} strokeWidth={1.8} />
                    {t(group.labelKey)}
                  </span>
                  <ChevronDown
                    className={cn(isExpanded && 'is-rotated')}
                    aria-hidden="true"
                    size={16}
                  />
                </button>
                <div
                  className={cn('member-nav-children', isExpanded && 'is-expanded')}
                  id={`trainer-nav-${group.id}`}
                >
                  {group.items.map((item) => {
                    const ItemIcon = item.icon ?? Circle;
                    const active = matchesTrainerRoute(item, location.pathname);
                    return (
                      <NavLink
                        key={`${group.id}-${item.labelKey}`}
                        to={item.to}
                        end={item.to === ROUTES.pt.root || item.to === ROUTES.pt.profile}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn('member-nav-link', active && 'is-active')}
                      >
                        <ItemIcon aria-hidden="true" size={13} strokeWidth={1.8} />
                        <span>{t(item.labelKey)}</span>
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
