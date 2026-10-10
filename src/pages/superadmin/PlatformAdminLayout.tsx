import type { LucideIcon } from 'lucide-react';
import {
  BriefcaseBusiness,
  ChevronDown,
  Circle,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  Languages,
  LayoutDashboard,
  LineChart,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { platformCopy } from '@/features/platform-admin-dashboard/ui/copy';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import '@/pages/member/components/member-layout.css';
import './platform-admin-layout.css';

type CopyKey =
  | 'overview'
  | 'tenants'
  | 'movementAssessment'
  | 'analyticsOverview'
  | 'gymApplications'
  | 'activeGyms'
  | 'legalChanges'
  | 'trainerApplications'
  | 'accountActions'
  | 'listings'
  | 'campaignsList'
  | 'pricing'
  | 'orders'
  | 'settlementsList'
  | 'disputesList'
  | 'platformAnalytics'
  | 'activity'
  | 'notifications';
type GroupKey =
  | 'dashboard'
  | 'approvals'
  | 'marketplace'
  | 'commercial'
  | 'campaigns'
  | 'transactions'
  | 'analytics'
  | 'security'
  | 'movement';

interface NavItem {
  label: CopyKey;
  to?: string;
}

interface NavGroup {
  id: GroupKey;
  icon: LucideIcon;
  items: ReadonlyArray<NavItem>;
}

const groups: ReadonlyArray<NavGroup> = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    items: [
      { label: 'overview', to: ROUTES.superadmin.root },
      { label: 'tenants', to: ROUTES.superadmin.tenants },
    ],
  },
  {
    id: 'approvals',
    icon: ClipboardCheck,
    items: [
      { label: 'gymApplications', to: ROUTES.superadmin.gymApplications },
      { label: 'activeGyms', to: ROUTES.superadmin.activeGyms },
      { label: 'legalChanges', to: ROUTES.superadmin.legalChanges },
      { label: 'trainerApplications', to: ROUTES.superadmin.trainerApplications },
      { label: 'accountActions', to: ROUTES.superadmin.accounts },
    ],
  },
  {
    id: 'marketplace',
    icon: Store,
    items: [{ label: 'listings', to: ROUTES.superadmin.listings }],
  },
  {
    id: 'commercial',
    icon: BriefcaseBusiness,
    items: [{ label: 'pricing', to: ROUTES.superadmin.commercial }],
  },
  {
    id: 'campaigns',
    icon: Megaphone,
    items: [{ label: 'campaignsList', to: ROUTES.superadmin.campaigns }],
  },
  {
    id: 'transactions',
    icon: CreditCard,
    items: [
      { label: 'orders', to: ROUTES.superadmin.orders },
      { label: 'settlementsList', to: ROUTES.superadmin.settlements },
      { label: 'disputesList', to: ROUTES.superadmin.disputes },
    ],
  },
  {
    id: 'analytics',
    icon: LineChart,
    items: [
      { label: 'analyticsOverview', to: ROUTES.superadmin.analytics },
      { label: 'platformAnalytics', to: ROUTES.superadmin.platformAnalytics },
    ],
  },
  {
    id: 'movement',
    icon: Dumbbell,
    items: [{ label: 'movementAssessment', to: ROUTES.superadmin.movementAssessment }],
  },
  {
    id: 'security',
    icon: ShieldCheck,
    items: [
      { label: 'notifications', to: ROUTES.superadmin.notifications },
      { label: 'activity', to: ROUTES.superadmin.audit },
    ],
  },
];

export function PlatformAdminLayout() {
  const { i18n, t } = useTranslation('common');
  const copy = platformCopy[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'];
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<ReadonlySet<GroupKey>>(() => new Set(['dashboard']));
  const userName = user?.fullName ?? copy.role;
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'P';

  useEffect(() => {
    const active = groups.find((group) =>
      group.items.some((item) => item.to === location.pathname),
    )?.id;
    if (!active) return;
    setExpanded((current) => (current.has(active) ? current : new Set([...current, active])));
  }, [location.pathname]);

  const toggleGroup = (id: GroupKey) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLanguage = () => {
    void i18n.changeLanguage(i18n.resolvedLanguage === 'vi' ? 'en' : 'vi');
  };

  const handleLogout = () => {
    void logout.mutate();
    void navigate(ROUTES.public.login, { replace: true });
  };

  return (
    <div className="member-shell platform-shell">
      <header className="member-mobile-header">
        <button
          type="button"
          className="member-icon-button"
          aria-label={isMenuOpen ? copy.closeMenu : copy.openMenu}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <div className="member-brand">
          <span>Fit®</span>
          <small>{copy.role}</small>
        </div>
        <div className="platform-mobile-actions">
          <button
            type="button"
            className="member-icon-button"
            aria-label={i18n.resolvedLanguage === 'vi' ? 'English' : 'Tiếng Việt'}
            onClick={toggleLanguage}
          >
            <Languages aria-hidden="true" size={18} />
          </button>
          <ThemeToggle />
        </div>
      </header>

      {isMenuOpen ? (
        <button
          type="button"
          className="member-sidebar-overlay"
          aria-label={copy.closeMenu}
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}

      <aside className={cn('member-sidebar', isMenuOpen && 'is-open')}>
        <div className="member-sidebar__brand">
          <div className="member-brand">
            <span>Fit®</span>
            <small>{copy.role}</small>
          </div>
          <span>{copy.workspace}</span>
        </div>
        <nav className="member-sidebar__nav" aria-label={copy.workspace}>
          {groups.map((group) => {
            const Icon = group.icon;
            const isExpanded = expanded.has(group.id);
            const active = group.items.some((item) => item.to === location.pathname);
            return (
              <div className="member-nav-group" key={group.id}>
                <button
                  type="button"
                  className={cn('member-nav-group__trigger', active && 'has-active-child')}
                  aria-expanded={isExpanded}
                  aria-controls={`platform-nav-${group.id}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>
                    <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                    {copy[group.id]}
                  </span>
                  <ChevronDown
                    className={cn(isExpanded && 'is-rotated')}
                    aria-hidden="true"
                    size={16}
                  />
                </button>
                <div
                  className={cn('member-nav-children', isExpanded && 'is-expanded')}
                  id={`platform-nav-${group.id}`}
                >
                  {group.items.map((item) =>
                    item.to ? (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        end
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => cn('member-nav-link', isActive && 'is-active')}
                      >
                        <Circle aria-hidden="true" size={13} />
                        <span>{copy[item.label]}</span>
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        key={item.label}
                        className="member-nav-link is-unavailable"
                        disabled
                      >
                        <Circle aria-hidden="true" size={13} />
                        <span>{copy[item.label]}</span>
                        <small>{copy.upcoming}</small>
                      </button>
                    ),
                  )}
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
              <span>{copy.role}</span>
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
            <span>Fit®</span>
            <span>/</span>
            <strong>{copy.workspace}</strong>
          </div>
          <div className="member-topbar__actions">
            <button type="button" onClick={toggleLanguage} className="member-language-button">
              <Languages aria-hidden="true" size={16} />
              <span>{i18n.resolvedLanguage === 'vi' ? 'English' : 'Tiếng Việt'}</span>
            </button>
            <ThemeToggle />
            <div className="member-topbar__profile">
              <div>
                <strong>{userName}</strong>
                <span>{copy.role}</span>
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
    </div>
  );
}
