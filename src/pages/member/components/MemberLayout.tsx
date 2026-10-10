import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Bot,
  ChevronDown,
  Circle,
  Dumbbell,
  Grid2X2,
  Languages,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings2,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { BRAND_MARK, ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';

import './member-layout.css';

interface MemberNavItem {
  labelKey: string;
  icon?: LucideIcon;
  to?: string;
}

interface MemberNavGroup {
  id: 'dashboard' | 'workout' | 'marketplace' | 'profile';
  labelKey: string;
  icon: LucideIcon;
  items: ReadonlyArray<MemberNavItem>;
}

const navGroups: ReadonlyArray<MemberNavGroup> = [
  {
    id: 'dashboard',
    labelKey: 'memberShell.dashboardGroup',
    icon: LayoutDashboard,
    items: [
      { labelKey: 'memberShell.overview', to: ROUTES.member.root, icon: Grid2X2 },
      { labelKey: 'memberShell.profileSetup', to: ROUTES.member.profileSetup, icon: Settings2 },
    ],
  },
  {
    id: 'workout',
    labelKey: 'memberShell.workoutGroup',
    icon: Dumbbell,
    items: [
      { labelKey: 'memberShell.workoutPlans', to: ROUTES.member.workout },
      { labelKey: 'memberShell.workoutBuilder', to: ROUTES.member.workoutBuilder },
      { labelKey: 'memberShell.weeklySchedule', to: ROUTES.member.workoutSchedule },
      { labelKey: 'memberShell.aiCoaching', to: ROUTES.member.coaching, icon: Bot },
      { labelKey: 'memberShell.workoutExecution', to: ROUTES.member.workoutExecution },
      { labelKey: 'memberShell.progressTracking', to: ROUTES.member.progress },
      { labelKey: 'memberShell.achievements', to: ROUTES.member.achievements },
      { labelKey: 'memberShell.aiAssessment', to: ROUTES.member.aiAssessment },
      { labelKey: 'memberShell.workoutHistory', to: ROUTES.member.workoutHistory },
    ],
  },
  {
    id: 'marketplace',
    labelKey: 'memberShell.marketplaceGroup',
    icon: Store,
    items: [
      { labelKey: 'memberShell.findGyms', to: ROUTES.member.marketplace },
      {
        labelKey: 'memberShell.gymDetails',
        to: ROUTES.member.marketplaceGymPath('fit-district-thao-dien'),
      },
      { labelKey: 'memberShell.gymOffers', to: ROUTES.member.marketplaceOffers },
      { labelKey: 'memberShell.trainers', to: ROUTES.member.marketplaceTrainers },
      { labelKey: 'memberShell.ptPackages', to: ROUTES.member.marketplacePackages },
      { labelKey: 'memberShell.checkout', to: ROUTES.member.marketplaceCheckout },
    ],
  },
  {
    id: 'profile',
    labelKey: 'memberShell.profileGroup',
    icon: UserRound,
    items: [
      { labelKey: 'memberShell.personalProfile', to: ROUTES.member.profile },
      { labelKey: 'memberShell.editProfile', to: ROUTES.member.profileEdit },
      { labelKey: 'memberShell.accountSecurity', to: ROUTES.member.profileSecurity },
      { labelKey: 'memberShell.assessmentHistory', to: ROUTES.member.profileAssessments },
      { labelKey: 'memberShell.appointments', to: ROUTES.member.profileAppointments },
      { labelKey: 'memberShell.wearables', to: ROUTES.member.profileWearables },
      { labelKey: 'memberShell.notifications', to: ROUTES.member.profileNotifications },
    ],
  },
];

const mobileNav: ReadonlyArray<{
  labelKey: string;
  icon: LucideIcon;
  to?: string;
}> = [
  {
    labelKey: 'memberShell.dashboardGroup',
    icon: Grid2X2,
    to: ROUTES.member.root,
  },
  {
    labelKey: 'memberShell.workoutGroup',
    icon: Dumbbell,
    to: ROUTES.member.workout,
  },
  {
    labelKey: 'memberShell.marketplaceGroup',
    icon: Store,
    to: ROUTES.member.marketplace,
  },
  {
    labelKey: 'memberShell.profileGroup',
    icon: UserRound,
    to: ROUTES.member.profile,
  },
];

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
  const location = useLocation();
  const initialGroup =
    navGroups.find((group) =>
      group.items.some((item) => item.to && matchesMemberNavRoute(item.to, location.pathname)),
    )?.id ?? 'dashboard';
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<MemberNavGroup['id']>>(
    () => new Set([initialGroup]),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const userInitial = user?.fullName?.trim().charAt(0).toUpperCase() || 'M';
  const userName = user?.fullName || 'Member';

  const handleLogout = () => {
    void logout.mutate();
    void navigate(ROUTES.public.login, { replace: true });
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
    <div className="member-shell">
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
        </div>

        <nav className="member-sidebar__nav" aria-label={t('memberShell.workspace')}>
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isExpanded = expandedGroups.has(group.id);
            const hasActiveChild = group.items.some(
              (item) => item.to && matchesMemberNavRoute(item.to, location.pathname),
            );

            return (
              <div className="member-nav-group" key={group.id}>
                <button
                  type="button"
                  className={cn('member-nav-group__trigger', hasActiveChild && 'has-active-child')}
                  aria-expanded={isExpanded}
                  aria-controls={`member-nav-${group.id}`}
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
                  id={`member-nav-${group.id}`}
                >
                  {group.items.map((item) => {
                    const ItemIcon = item.icon ?? Circle;

                    if (!item.to) {
                      return (
                        <button
                          type="button"
                          className="member-nav-link is-unavailable"
                          key={item.labelKey}
                          disabled
                        >
                          <ItemIcon aria-hidden="true" size={13} strokeWidth={1.8} />
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
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => cn('member-nav-link', isActive && 'is-active')}
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
            <button
              type="button"
              className="member-icon-button"
              aria-label={t('memberShell.notifications')}
              onClick={() => navigate(ROUTES.member.profileNotifications)}
            >
              <Bell aria-hidden="true" size={18} />
            </button>
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

          if (!item.to) {
            return (
              <button type="button" key={item.labelKey} disabled>
                <Icon aria-hidden="true" size={19} strokeWidth={1.8} />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.member.root}
              className={({ isActive }) => cn(isActive && 'is-active')}
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
