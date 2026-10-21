import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Dumbbell,
  FileText,
  History,
  Landmark,
  Languages,
  LayoutDashboard,
  LineChart,
  List,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  ReceiptText,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  TriangleAlert,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { isNavigationRouteActive } from './navigationRoute';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { platformCopy } from '@/features/platform-admin-dashboard/ui/copy';
import { ROUTES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import {
  matchesSidebarSearch,
  SidebarSearch,
  SidebarToggle,
  useSidebarCollapse,
  useSidebarFlyout,
} from '@/shared/ui/sidebar-controls';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import '@/pages/member/components/member-layout.css';
import './platform-admin-layout.css';

type CopyKey =
  | 'overview'
  | 'tenants'
  | 'movementAssessment'
  | 'analyticsOverview'
  | 'gymApplications'
  | 'marketplaceReview'
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
  icon: LucideIcon;
  to?: string;
}

interface NavGroup {
  id: GroupKey;
  icon: LucideIcon;
  to?: string;
  items: ReadonlyArray<NavItem>;
}

const groups: ReadonlyArray<NavGroup> = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    items: [
      { label: 'overview', to: ROUTES.superadmin.root, icon: LayoutDashboard },
      { label: 'tenants', to: ROUTES.superadmin.tenants, icon: Building2 },
    ],
  },
  {
    id: 'approvals',
    icon: ClipboardCheck,
    items: [
      { label: 'gymApplications', to: ROUTES.superadmin.gymApplications, icon: Building2 },
      { label: 'marketplaceReview', to: ROUTES.superadmin.marketplaceReview, icon: ClipboardCheck },
      { label: 'activeGyms', to: ROUTES.superadmin.activeGyms, icon: BadgeCheck },
      { label: 'legalChanges', to: ROUTES.superadmin.legalChanges, icon: FileText },
      { label: 'trainerApplications', to: ROUTES.superadmin.trainerApplications, icon: UserRound },
      { label: 'accountActions', to: ROUTES.superadmin.accounts, icon: UsersRound },
    ],
  },
  {
    id: 'commercial',
    icon: SlidersHorizontal,
    items: [
      { label: 'listings', to: ROUTES.superadmin.listings, icon: List },
      { label: 'pricing', to: ROUTES.superadmin.commercial, icon: Tag },
      { label: 'campaignsList', to: ROUTES.superadmin.campaigns, icon: Megaphone },
    ],
  },
  {
    id: 'transactions',
    icon: ReceiptText,
    items: [
      { label: 'orders', to: ROUTES.superadmin.orders, icon: ReceiptText },
      { label: 'settlementsList', to: ROUTES.superadmin.settlements, icon: Landmark },
      { label: 'disputesList', to: ROUTES.superadmin.disputes, icon: TriangleAlert },
    ],
  },
  {
    id: 'analytics',
    icon: LineChart,
    items: [
      {
        label: 'analyticsOverview',
        to: ROUTES.superadmin.analytics,
        icon: LayoutDashboard,
      },
      {
        label: 'platformAnalytics',
        to: ROUTES.superadmin.platformAnalytics,
        icon: LineChart,
      },
    ],
  },
  {
    id: 'movement',
    icon: Dumbbell,
    items: [
      {
        label: 'movementAssessment',
        to: ROUTES.superadmin.movementAssessment,
        icon: ClipboardCheck,
      },
    ],
  },
  {
    id: 'security',
    icon: ShieldCheck,
    items: [
      { label: 'notifications', to: ROUTES.superadmin.notifications, icon: Bell },
      { label: 'activity', to: ROUTES.superadmin.audit, icon: History },
    ],
  },
];

function matchesPlatformRoute(to: string, pathname: string) {
  if (to === ROUTES.superadmin.root) return pathname === to;
  return isNavigationRouteActive(pathname, to);
}

export function PlatformAdminLayout() {
  const { i18n, t } = useTranslation('common');
  const copy = platformCopy[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'];
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useSidebarCollapse();
  const [sidebarQuery, setSidebarQuery] = useState('');
  const { flyout, toggleFlyout, closeFlyout } = useSidebarFlyout();
  const [expanded, setExpanded] = useState<ReadonlySet<GroupKey>>(() => new Set(['dashboard']));
  const userName = user?.fullName ?? copy.role;
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'P';
  const query = sidebarQuery.trim();
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items:
        !query || matchesSidebarSearch(copy[group.id], query)
          ? group.items
          : group.items.filter((item) => matchesSidebarSearch(copy[item.label], query)),
    }))
    .filter(
      (group) =>
        group.items.length > 0 ||
        (group.to && (!query || matchesSidebarSearch(copy[group.id], query))),
    );

  const activeItem = groups
    .flatMap((group) => group.items)
    .filter((item) => item.to && matchesPlatformRoute(item.to, location.pathname))
    .sort((a, b) => (b.to?.length ?? 0) - (a.to?.length ?? 0))[0];

  useEffect(() => closeFlyout(), [closeFlyout, location.pathname]);

  useEffect(() => {
    const active = groups.find((group) =>
      group.items.some((item) => item.to && matchesPlatformRoute(item.to, location.pathname)),
    )?.id;
    if (!active) return;
    setExpanded((current) => (current.has(active) ? current : new Set([...current, active])));
  }, [location.pathname]);

  const toggleGroup = (id: GroupKey) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      setExpanded((current) => new Set([...current, id]));
      return;
    }
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
    <div
      className={cn('member-shell platform-shell', isSidebarCollapsed && 'is-sidebar-collapsed')}
    >
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
          <SidebarToggle
            collapsed={isSidebarCollapsed}
            isVi={i18n.resolvedLanguage === 'vi'}
            onToggle={() => {
              if (!isSidebarCollapsed) setSidebarQuery('');
              closeFlyout();
              setIsSidebarCollapsed((collapsed) => !collapsed);
            }}
          />
        </div>
        <nav className="member-sidebar__nav" aria-label={copy.workspace}>
          <SidebarSearch
            query={sidebarQuery}
            isVi={i18n.resolvedLanguage === 'vi'}
            onChange={setSidebarQuery}
          />
          {visibleGroups.map((group) => {
            const Icon = group.icon;

            // Direct link trigger for single destination items
            if (group.to && (!group.items || group.items.length === 0)) {
              const active = matchesPlatformRoute(group.to, location.pathname);
              return (
                <div className="member-nav-group" key={group.id}>
                  <NavLink
                    to={group.to}
                    end={group.to === ROUTES.superadmin.root}
                    onClick={() => {
                      setIsMenuOpen(false);
                      closeFlyout();
                    }}
                    aria-label={copy[group.id]}
                    title={isSidebarCollapsed ? copy[group.id] : undefined}
                    className={cn(
                      'member-nav-group__trigger is-direct-link',
                      active && 'is-active',
                    )}
                  >
                    <span>
                      <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                      <span className="member-nav-group__label">{copy[group.id]}</span>
                    </span>
                  </NavLink>
                </div>
              );
            }

            const isFlyoutOpen = isSidebarCollapsed && flyout?.id === group.id;
            const isExpanded = isSidebarCollapsed
              ? isFlyoutOpen
              : Boolean(query) || expanded.has(group.id);
            const active = group.items.some(
              (item) => item.to && matchesPlatformRoute(item.to, location.pathname),
            );
            return (
              <div className="member-nav-group" key={group.id}>
                <button
                  type="button"
                  className={cn(
                    'member-nav-group__trigger',
                    isExpanded && 'is-expanded',
                    active && 'has-active-child',
                    isFlyoutOpen && 'is-flyout-open',
                  )}
                  aria-expanded={isExpanded}
                  aria-label={copy[group.id]}
                  title={isSidebarCollapsed ? copy[group.id] : undefined}
                  aria-controls={`platform-nav-${group.id}`}
                  onClick={(event) =>
                    isSidebarCollapsed
                      ? toggleFlyout(group.id, event.currentTarget, group.items.length)
                      : toggleGroup(group.id)
                  }
                >
                  <span>
                    <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                    <span className="member-nav-group__label">{copy[group.id]}</span>
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
                  id={`platform-nav-${group.id}`}
                  style={isFlyoutOpen ? { top: flyout?.top } : undefined}
                >
                  <div className="member-nav-children__heading">{copy[group.id]}</div>
                  {group.items.map((item) =>
                    item.to ? (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        end
                        onClick={() => {
                          setIsMenuOpen(false);
                          closeFlyout();
                        }}
                        aria-label={copy[item.label]}
                        title={isSidebarCollapsed ? copy[item.label] : undefined}
                        className={({ isActive }) =>
                          cn(
                            'member-nav-link',
                            (isActive || matchesPlatformRoute(item.to!, location.pathname)) &&
                              'is-active',
                          )
                        }
                      >
                        <item.icon aria-hidden="true" size={16} strokeWidth={1.8} />
                        <span>{copy[item.label]}</span>
                      </NavLink>
                    ) : (
                      <button
                        type="button"
                        key={item.label}
                        className="member-nav-link is-unavailable"
                        disabled
                        aria-label={copy[item.label]}
                        title={isSidebarCollapsed ? copy[item.label] : undefined}
                      >
                        <item.icon aria-hidden="true" size={16} strokeWidth={1.8} />
                        <span>{copy[item.label]}</span>
                        <small>{copy.upcoming}</small>
                      </button>
                    ),
                  )}
                </div>
              </div>
            );
          })}
          {visibleGroups.length === 0 ? (
            <p className="member-sidebar__no-results">
              {i18n.resolvedLanguage === 'vi'
                ? 'Không tìm thấy mục phù hợp'
                : 'No matching menu items'}
            </p>
          ) : null}
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
            <strong>{activeItem ? copy[activeItem.label] : copy.workspace}</strong>
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
