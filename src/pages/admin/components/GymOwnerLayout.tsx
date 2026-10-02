import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  ChevronDown,
  Circle,
  ClipboardCheck,
  FileCheck2,
  Languages,
  Landmark,
  LayoutDashboard,
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
import { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '@/features/auth/model/useAuth';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding';
import { ROUTES } from '@/shared/config/constants';
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
    | 'onboarding';
  label: string;
  icon: LucideIcon;
  items: ReadonlyArray<OwnerNavItem>;
}

function matchesRoute(to: string, pathname: string) {
  if (to === ROUTES.admin.root || to === ROUTES.admin.onboarding) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function GymOwnerLayout() {
  const { i18n, t } = useTranslation('common');
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
        label: isVi ? 'Tổng quan' : 'Dashboard',
        icon: LayoutDashboard,
        items: [{ label: isVi ? 'Bảng điều khiển' : 'Overview', to: ROUTES.admin.root }],
      });
      groups.push({
        id: 'profile',
        label: isVi ? 'Hồ sơ phòng gym' : 'Gym profile',
        icon: Building2,
        items: [
          {
            label: isVi ? 'Tổng quan hồ sơ' : 'Profile overview',
            to: ROUTES.admin.profile,
            icon: Building2,
          },
          {
            label: isVi ? 'Thông tin thương hiệu' : 'Brand information',
            to: ROUTES.admin.profileBrand,
            icon: ClipboardCheck,
          },
          {
            label: isVi ? 'Chi nhánh' : 'Branches',
            to: ROUTES.admin.profileBranches,
            icon: Circle,
          },
        ],
      });
      groups.push({
        id: 'trainers',
        label: isVi ? 'Đội ngũ Trainer' : 'Trainers',
        icon: UsersRound,
        items: [
          {
            label: isVi ? 'Danh sách Trainer' : 'Trainer list',
            to: ROUTES.admin.pts,
            icon: UsersRound,
          },
          {
            label: isVi ? 'Ngoại lệ phân công' : 'Assignment exceptions',
            to: ROUTES.admin.trainerAssignments,
            icon: ClipboardCheck,
          },
        ],
      });
      groups.push({
        id: 'packages',
        label: isVi ? 'Gói PT' : 'PT packages',
        icon: PackageCheck,
        items: [
          {
            label: isVi ? 'Quản lý gói PT' : 'Package management',
            to: ROUTES.admin.packages,
            icon: PackageCheck,
          },
        ],
      });
      groups.push({
        id: 'customers',
        label: isVi ? 'Khách hàng / Người mua' : 'Customers / Purchasers',
        icon: ReceiptText,
        items: [
          {
            label: isVi ? 'Danh sách vận hành' : 'Operational list',
            to: ROUTES.admin.customers,
            icon: ReceiptText,
          },
        ],
      });
      groups.push({
        id: 'orders',
        label: isVi ? 'Đơn hàng & đối soát' : 'Orders & Settlement',
        icon: Landmark,
        items: [
          {
            label: isVi ? 'Đơn hàng' : 'Orders',
            to: ROUTES.admin.orders,
            icon: ReceiptText,
          },
          {
            label: isVi ? 'Kỳ đối soát' : 'Settlement periods',
            to: ROUTES.admin.settlements,
            icon: Landmark,
          },
        ],
      });
    }
    groups.push({
      id: 'onboarding',
      label: isVi ? 'Thiết lập đối tác' : 'Partner setup',
      icon: ClipboardCheck,
      items: [
        {
          label: isVi ? 'Tổng quan hồ sơ' : 'Setup overview',
          to: ROUTES.admin.onboarding,
          icon: ClipboardCheck,
        },
        {
          label: isVi ? 'Thương hiệu & chi nhánh' : 'Brand & branches',
          to: ROUTES.admin.onboardingProfile,
          icon: Building2,
        },
        {
          label: isVi ? 'Giấy phép kinh doanh' : 'Business license',
          to: ROUTES.admin.onboardingLicense,
          icon: FileCheck2,
        },
        {
          label: isVi ? 'Xem lại & gửi' : 'Review & submit',
          to: ROUTES.admin.onboardingReview,
          icon: ShieldCheck,
        },
        {
          label: isVi ? 'Trạng thái phê duyệt' : 'Approval status',
          to: ROUTES.admin.onboardingStatus,
          icon: Circle,
        },
      ],
    });
    return groups;
  }, [isVi, status]);

  const initialGroup =
    navGroups.find((group) => group.items.some((item) => matchesRoute(item.to, location.pathname)))
      ?.id ?? 'onboarding';
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<OwnerNavGroup['id']>>(
    () => new Set([initialGroup]),
  );

  const userName = user?.fullName || (isVi ? 'Chủ phòng gym' : 'Gym Owner');
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'G';
  const ownerLabel = isVi ? 'Chủ phòng gym' : 'Gym Owner';
  const workspaceLabel = isVi ? 'Không gian đối tác' : 'Partner workspace';

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

  const mobileItems = navGroups.flatMap((group) => group.items).slice(0, 4);

  return (
    <div className="member-shell owner-shell">
      <header className="member-mobile-header">
        <button
          type="button"
          className="member-icon-button"
          aria-label={
            isMenuOpen ? (isVi ? 'Đóng menu' : 'Close menu') : isVi ? 'Mở menu' : 'Open menu'
          }
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <div className="member-brand">
          <span>Fit®</span>
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
          aria-label={isVi ? 'Đóng menu' : 'Close menu'}
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}

      <aside className={cn('member-sidebar', isMenuOpen && 'is-open')}>
        <div className="member-sidebar__brand">
          <div className="member-brand">
            <span>Fit®</span>
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
                        end={
                          item.to === ROUTES.admin.root ||
                          item.to === ROUTES.admin.onboarding ||
                          item.to === ROUTES.admin.pts ||
                          item.to === ROUTES.admin.packages ||
                          item.to === ROUTES.admin.customers ||
                          item.to === ROUTES.admin.orders ||
                          item.to === ROUTES.admin.settlements
                        }
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
            <strong>{workspaceLabel}</strong>
          </div>
          <div className="member-topbar__actions">
            <button type="button" onClick={toggleLanguage} className="member-language-button">
              <Languages aria-hidden="true" size={16} />
              <span>{isVi ? 'English' : 'Tiếng Việt'}</span>
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
                <span>{t('loading')}</span>
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
              end={
                item.to === ROUTES.admin.root ||
                item.to === ROUTES.admin.onboarding ||
                item.to === ROUTES.admin.pts ||
                item.to === ROUTES.admin.packages ||
                item.to === ROUTES.admin.customers ||
                item.to === ROUTES.admin.orders ||
                item.to === ROUTES.admin.settlements
              }
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
