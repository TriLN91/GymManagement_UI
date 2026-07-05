import { lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { PortalLayout, type NavItem } from '../providers/PortalLayout';

import { AuthGuard } from './guards/AuthGuard';
import { RoleGuard } from './guards/RoleGuard';
import { TenantGuard } from './guards/TenantGuard';

import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ROUTES } from '@/shared/config/constants';

// Lazy per-portal pages — keeps the JS payload for `/app` from shipping `/admin`.
const MemberDashboardPage = lazy(() =>
  import('@/pages/member/MemberDashboardPage').then((m) => ({ default: m.MemberDashboardPage })),
);
const MemberCoachingPage = lazy(() =>
  import('@/pages/member/coaching/CoachingPlanPage').then((m) => ({
    default: m.MemberCoachingPage,
  })),
);
const MemberWorkoutPage = lazy(() =>
  import('@/pages/member/MemberWorkoutPage').then((m) => ({ default: m.MemberWorkoutPage })),
);

const PTDashboardPage = lazy(() =>
  import('@/pages/pt/PTDashboardPage').then((m) => ({ default: m.PTDashboardPage })),
);
const PTMembersPage = lazy(() =>
  import('@/pages/pt/PTMembersPage').then((m) => ({ default: m.PTMembersPage })),
);
const PTSchedulePage = lazy(() =>
  import('@/pages/pt/PTSchedulePage').then((m) => ({ default: m.PTSchedulePage })),
);

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminPtsPage = lazy(() =>
  import('@/pages/admin/AdminPtsPage').then((m) => ({ default: m.AdminPtsPage })),
);
const AdminPackagesPage = lazy(() =>
  import('@/pages/admin/AdminPackagesPage').then((m) => ({ default: m.AdminPackagesPage })),
);

const SuperAdminDashboardPage = lazy(() =>
  import('@/pages/superadmin/SuperAdminDashboardPage').then((m) => ({
    default: m.SuperAdminDashboardPage,
  })),
);
const SuperAdminTenantsPage = lazy(() =>
  import('@/pages/superadmin/SuperAdminTenantsPage').then((m) => ({
    default: m.SuperAdminTenantsPage,
  })),
);
// Reserved for a future analytics route — wired via ROUTES.superadmin.analytics.
const SuperAdminAnalyticsPage = lazy(() =>
  import('@/pages/superadmin/SuperAdminAnalyticsPage').then((m) => ({
    default: m.SuperAdminAnalyticsPage,
  })),
);

// Nav definitions — typed arrays, no `any`.
const memberNav: ReadonlyArray<NavItem> = [
  { to: ROUTES.member.root, labelKey: 'nav.dashboard' },
  { to: ROUTES.member.coaching, labelKey: 'nav.coaching' },
  { to: ROUTES.member.workout, labelKey: 'nav.workout' },
];
const ptNav: ReadonlyArray<NavItem> = [
  { to: ROUTES.pt.root, labelKey: 'nav.dashboard' },
  { to: ROUTES.pt.members, labelKey: 'nav.members' },
  { to: ROUTES.pt.plans, labelKey: 'nav.schedule' },
];
const adminNav: ReadonlyArray<NavItem> = [
  { to: ROUTES.admin.root, labelKey: 'nav.dashboard' },
  { to: ROUTES.admin.pts, labelKey: 'nav.pts' },
  { to: ROUTES.admin.packages, labelKey: 'nav.packages' },
];
const superAdminNav: ReadonlyArray<NavItem> = [
  { to: ROUTES.superadmin.root, labelKey: 'nav.dashboard' },
  { to: ROUTES.superadmin.tenants, labelKey: 'nav.tenants' },
];

const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ROUTES.public.login} replace /> },
  { path: ROUTES.public.login, element: <LoginPage /> },
  { path: ROUTES.public.register, element: <RegisterPage /> },
  { path: ROUTES.public.forgotPassword, element: <ForgotPasswordPage /> },
  { path: ROUTES.public.resetPassword, element: <ResetPasswordPage /> },
  { path: ROUTES.public.forbidden, element: <ForbiddenPage /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <NotFoundPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <TenantGuard />,
        children: [
          {
            element: <RoleGuard allow="member" />,
            children: [
              {
                element: <PortalLayout titleKey="portals.member" nav={memberNav} />,
                children: [
                  { path: ROUTES.member.root, element: <MemberDashboardPage /> },
                  { path: ROUTES.member.coaching, element: <MemberCoachingPage /> },
                  { path: ROUTES.member.workout, element: <MemberWorkoutPage /> },
                ],
              },
            ],
          },
          {
            element: <RoleGuard allow="pt" />,
            children: [
              {
                element: <PortalLayout titleKey="portals.pt" nav={ptNav} />,
                children: [
                  { path: ROUTES.pt.root, element: <PTDashboardPage /> },
                  { path: ROUTES.pt.members, element: <PTMembersPage /> },
                  { path: ROUTES.pt.plans, element: <PTSchedulePage /> },
                ],
              },
            ],
          },
          {
            element: <RoleGuard allow="gym_admin" />,
            children: [
              {
                element: <PortalLayout titleKey="portals.admin" nav={adminNav} />,
                children: [
                  { path: ROUTES.admin.root, element: <AdminDashboardPage /> },
                  { path: ROUTES.admin.pts, element: <AdminPtsPage /> },
                  { path: ROUTES.admin.packages, element: <AdminPackagesPage /> },
                ],
              },
            ],
          },
          {
            element: <RoleGuard allow="super_admin" />,
            children: [
              {
                element: <PortalLayout titleKey="portals.superadmin" nav={superAdminNav} />,
                children: [
                  { path: ROUTES.superadmin.root, element: <SuperAdminDashboardPage /> },
                  { path: ROUTES.superadmin.tenants, element: <SuperAdminTenantsPage /> },
                  { path: ROUTES.superadmin.analytics, element: <SuperAdminAnalyticsPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
