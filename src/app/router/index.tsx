import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AuthGuard } from './guards/AuthGuard';
import { GymOwnerApprovalGuard } from './guards/GymOwnerApprovalGuard';
import { GymOwnerEditableGuard } from './guards/GymOwnerEditableGuard';
import { RoleGuard } from './guards/RoleGuard';

import { GymOwnerLayout } from '@/pages/admin/components/GymOwnerLayout';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { MemberLayout } from '@/pages/member/components/MemberLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { TrainerLayout } from '@/pages/pt/components/TrainerLayout';
import { PlatformAdminLayout } from '@/pages/superadmin/PlatformAdminLayout';
import { ROUTES } from '@/shared/config/constants';

const LandingPage = lazy(() =>
  import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })),
);

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
const WeeklySchedule = lazy(() =>
  import('@/features/workout-plans').then((m) => ({ default: m.WeeklySchedule })),
);
const TrainingDayDetail = lazy(() =>
  import('@/features/workout-plans').then((m) => ({ default: m.TrainingDayDetail })),
);
const WorkoutExecution = lazy(() =>
  import('@/features/workout-plans').then((m) => ({ default: m.WorkoutExecution })),
);
const WorkoutExecutionEntry = lazy(() =>
  import('@/features/workout-plans').then((m) => ({ default: m.WorkoutExecutionEntry })),
);
const WorkoutProgress = lazy(() =>
  import('@/features/workout-plans').then((m) => ({ default: m.WorkoutProgress })),
);
const WorkoutHistory = lazy(() =>
  import('@/features/workout-plans').then((m) => ({ default: m.WorkoutHistory })),
);
const WorkoutCompletion = lazy(() =>
  import('@/features/workout-plans').then((m) => ({ default: m.WorkoutCompletion })),
);
const MemberWorkoutBuilder = lazy(() =>
  import('@/features/member-workout-builder').then((m) => ({ default: m.MemberWorkoutBuilder })),
);
const AIAssessmentPage = lazy(() =>
  import('@/features/camera-assessment').then((m) => ({ default: m.AIAssessmentPage })),
);
const AchievementsPage = lazy(() =>
  import('@/features/gamification').then((m) => ({ default: m.AchievementsPage })),
);
const MarketplaceHome = lazy(() =>
  import('@/features/marketplace').then((m) => ({ default: m.MarketplaceHome })),
);
const GymDetailPage = lazy(() =>
  import('@/features/marketplace').then((m) => ({ default: m.GymDetailPage })),
);
const GymOffersPage = lazy(() =>
  import('@/features/marketplace').then((m) => ({ default: m.GymOffersPage })),
);
const TrainerDiscoveryPage = lazy(() =>
  import('@/features/marketplace').then((m) => ({ default: m.TrainerDiscoveryPage })),
);
const TrainerDetailPage = lazy(() =>
  import('@/features/marketplace').then((m) => ({ default: m.TrainerDetailPage })),
);
const PTPackagesPage = lazy(() =>
  import('@/features/marketplace').then((m) => ({ default: m.PTPackagesPage })),
);
const MarketplaceCheckoutPage = lazy(() =>
  import('@/features/marketplace').then((m) => ({ default: m.MarketplaceCheckoutPage })),
);
const MarketplacePaymentResultPage = lazy(() =>
  import('@/features/marketplace').then((m) => ({ default: m.MarketplacePaymentResultPage })),
);

const ProfileSetupPage = lazy(() =>
  import('@/pages/member/profile/ProfileSetupPage').then((m) => ({ default: m.ProfileSetupPage })),
);
const PersonalProfilePage = lazy(() =>
  import('@/pages/member/profile/MemberProfilePages').then((m) => ({
    default: m.PersonalProfilePage,
  })),
);
const EditPersonalProfilePage = lazy(() =>
  import('@/pages/member/profile/MemberProfilePages').then((m) => ({
    default: m.EditPersonalProfilePage,
  })),
);
const AccountSecurityPage = lazy(() =>
  import('@/pages/member/profile/MemberProfilePages').then((m) => ({
    default: m.AccountSecurityPage,
  })),
);
const AssessmentHistoryPage = lazy(() =>
  import('@/pages/member/profile/MemberProfilePages').then((m) => ({
    default: m.AssessmentHistoryPage,
  })),
);
const AssessmentDetailPage = lazy(() =>
  import('@/pages/member/profile/MemberProfilePages').then((m) => ({
    default: m.AssessmentDetailPage,
  })),
);
const PTAppointmentsPage = lazy(() =>
  import('@/pages/member/profile/MemberProfilePages').then((m) => ({
    default: m.PTAppointmentsPage,
  })),
);
const WearableConnectionsPage = lazy(() =>
  import('@/pages/member/profile/MemberProfilePages').then((m) => ({
    default: m.WearableConnectionsPage,
  })),
);
const MemberNotificationsPage = lazy(() =>
  import('@/pages/member/profile/MemberProfilePages').then((m) => ({
    default: m.MemberNotificationsPage,
  })),
);

const PTDashboardPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerDashboardPage,
  })),
);
const TrainerProfilePage = lazy(() =>
  import('@/pages/pt/profile/TrainerProfilePages').then((m) => ({
    default: m.TrainerProfilePage,
  })),
);
const EditTrainerProfilePage = lazy(() =>
  import('@/pages/pt/profile/TrainerProfilePages').then((m) => ({
    default: m.EditTrainerProfilePage,
  })),
);
const TrainerGymInformationPage = lazy(() =>
  import('@/pages/pt/profile/TrainerProfilePages').then((m) => ({
    default: m.TrainerGymInformationPage,
  })),
);
const PTMembersPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerMembersPage,
  })),
);
const TrainerMemberDetailPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerMemberDetailPage,
  })),
);
const TrainerMemberDataPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerMemberDataPage,
  })),
);
const TrainerExerciseLibraryPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerExerciseLibraryPage,
  })),
);
const PlanBuilderPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerPlanBuilderPage,
  })),
);
const TrainerMemberWorkoutPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerMemberWorkoutPage,
  })),
);
const TrainerAppointmentsPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerAppointmentsPage,
  })),
);
const TrainerCoachingHistoryPage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerCoachingHistoryPage,
  })),
);
const TrainerIncomePage = lazy(() =>
  import('@/pages/pt/workspace/TrainerWorkspacePages').then((m) => ({
    default: m.TrainerIncomePage,
  })),
);

const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const GymOwnerTrainerListPage = lazy(() =>
  import('@/features/gym-owner-training').then((m) => ({
    default: m.GymOwnerTrainerListPage,
  })),
);
const GymOwnerTrainerFormPage = lazy(() =>
  import('@/features/gym-owner-training').then((m) => ({
    default: m.GymOwnerTrainerFormPage,
  })),
);
const GymOwnerTrainerDetailPage = lazy(() =>
  import('@/features/gym-owner-training').then((m) => ({
    default: m.GymOwnerTrainerDetailPage,
  })),
);
const GymOwnerAssignmentExceptionsPage = lazy(() =>
  import('@/features/gym-owner-training').then((m) => ({
    default: m.GymOwnerAssignmentExceptionsPage,
  })),
);
const GymOwnerPTPackageListPage = lazy(() =>
  import('@/features/gym-owner-training').then((m) => ({
    default: m.GymOwnerPTPackageListPage,
  })),
);
const GymOwnerPTPackageFormPage = lazy(() =>
  import('@/features/gym-owner-training').then((m) => ({
    default: m.GymOwnerPTPackageFormPage,
  })),
);
const GymOwnerPTPackageDetailPage = lazy(() =>
  import('@/features/gym-owner-training').then((m) => ({
    default: m.GymOwnerPTPackageDetailPage,
  })),
);
const GymOwnerCustomersPage = lazy(() =>
  import('@/features/gym-owner-customers').then((m) => ({
    default: m.GymOwnerCustomersPage,
  })),
);
const GymOwnerOrdersPage = lazy(() =>
  import('@/features/gym-owner-orders').then((m) => ({
    default: m.GymOwnerOrdersPage,
  })),
);
const GymOwnerOrderDetailPage = lazy(() =>
  import('@/features/gym-owner-orders').then((m) => ({
    default: m.GymOwnerOrderDetailPage,
  })),
);
const GymOwnerSettlementsPage = lazy(() =>
  import('@/features/gym-owner-orders').then((m) => ({
    default: m.GymOwnerSettlementsPage,
  })),
);
const GymOwnerAnalyticsPage = lazy(() =>
  import('@/features/gym-owner-analytics').then((m) => ({
    default: m.GymOwnerAnalyticsPage,
  })),
);
const GymOwnerNotificationsPage = lazy(() =>
  import('@/features/gym-owner-account').then((m) => ({
    default: m.GymOwnerNotificationsPage,
  })),
);
const GymOwnerAccountSecurityPage = lazy(() =>
  import('@/features/gym-owner-account').then((m) => ({
    default: m.GymOwnerAccountSecurityPage,
  })),
);
const GymOwnerOnboardingEntryPage = lazy(() =>
  import('@/features/gym-owner-onboarding').then((m) => ({
    default: m.GymOwnerOnboardingEntryPage,
  })),
);
const GymOwnerBrandBranchPage = lazy(() =>
  import('@/features/gym-owner-onboarding').then((m) => ({
    default: m.GymOwnerBrandBranchPage,
  })),
);
const GymOwnerLicensePage = lazy(() =>
  import('@/features/gym-owner-onboarding').then((m) => ({ default: m.GymOwnerLicensePage })),
);
const GymOwnerReviewPage = lazy(() =>
  import('@/features/gym-owner-onboarding').then((m) => ({ default: m.GymOwnerReviewPage })),
);
const GymOwnerApprovalStatusPage = lazy(() =>
  import('@/features/gym-owner-onboarding').then((m) => ({
    default: m.GymOwnerApprovalStatusPage,
  })),
);
const GymOwnerProfileOverviewPage = lazy(() =>
  import('@/features/gym-owner-profile').then((m) => ({
    default: m.GymOwnerProfileOverviewPage,
  })),
);
const GymOwnerBrandProfilePage = lazy(() =>
  import('@/features/gym-owner-profile').then((m) => ({
    default: m.GymOwnerBrandProfilePage,
  })),
);
const GymOwnerBranchesPage = lazy(() =>
  import('@/features/gym-owner-profile').then((m) => ({ default: m.GymOwnerBranchesPage })),
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
// Reserved for a future analytics route
const SuperAdminAnalyticsPage = lazy(() =>
  import('@/pages/superadmin/SuperAdminAnalyticsPage').then((m) => ({
    default: m.SuperAdminAnalyticsPage,
  })),
);
const MovementAssessmentPage = lazy(() =>
  import('@/pages/superadmin/MovementAssessmentPage').then((m) => ({
    default: m.MovementAssessmentPage,
  })),
);
const MovementReferenceSetPage = lazy(() =>
  import('@/pages/superadmin/MovementReferenceSetPage').then((m) => ({
    default: m.MovementReferenceSetPage,
  })),
);
const PlatformGymApplicationsPage = lazy(() =>
  import('@/features/platform-admin-approvals').then((m) => ({
    default: () => <m.PlatformApprovalQueuePage kind="gym_application" />,
  })),
);
const PlatformLegalChangesPage = lazy(() =>
  import('@/features/platform-admin-approvals').then((m) => ({
    default: () => <m.PlatformApprovalQueuePage kind="legal_change" />,
  })),
);
const PlatformTrainerApplicationsPage = lazy(() =>
  import('@/features/platform-admin-approvals').then((m) => ({
    default: () => <m.PlatformApprovalQueuePage kind="trainer_application" />,
  })),
);
const PlatformGymApplicationDetailPage = lazy(() =>
  import('@/features/platform-admin-approvals').then((m) => ({
    default: () => <m.PlatformApprovalDetailPage kind="gym_application" />,
  })),
);
const PlatformGymsPage = lazy(() =>
  import('@/features/platform-admin-gyms').then((m) => ({ default: m.PlatformGymsPage })),
);
const PlatformGymDetailPage = lazy(() =>
  import('@/features/platform-admin-gyms').then((m) => ({ default: m.PlatformGymDetailPage })),
);
const PlatformLegalChangeDetailPage = lazy(() =>
  import('@/features/platform-admin-approvals').then((m) => ({
    default: () => <m.PlatformApprovalDetailPage kind="legal_change" />,
  })),
);
const PlatformTrainerApplicationDetailPage = lazy(() =>
  import('@/features/platform-admin-approvals').then((m) => ({
    default: () => <m.PlatformApprovalDetailPage kind="trainer_application" />,
  })),
);
const PlatformAccountsPage = lazy(() =>
  import('@/features/platform-admin-approvals').then((m) => ({ default: m.PlatformAccountsPage })),
);
const PlatformListingsPage = lazy(() =>
  import('@/features/platform-admin-operations').then((m) => ({ default: m.PlatformListingsPage })),
);
const PlatformListingDetailPage = lazy(() =>
  import('@/features/platform-admin-operations').then((m) => ({
    default: m.PlatformListingDetailPage,
  })),
);
const PlatformCampaignsPage = lazy(() =>
  import('@/features/platform-admin-operations').then((m) => ({
    default: m.PlatformCampaignsPage,
  })),
);
const PlatformCampaignFormPage = lazy(() =>
  import('@/features/platform-admin-operations').then((m) => ({
    default: m.PlatformCampaignFormPage,
  })),
);
const PlatformCampaignDetailPage = lazy(() =>
  import('@/features/platform-admin-operations').then((m) => ({
    default: m.PlatformCampaignDetailPage,
  })),
);
const PlatformNotificationsPage = lazy(() =>
  import('@/features/platform-admin-operations').then((m) => ({
    default: m.PlatformNotificationsPage,
  })),
);
const PlatformCommercialConfigPage = lazy(() =>
  import('@/features/platform-admin-commercial').then((m) => ({
    default: m.PlatformCommercialConfigPage,
  })),
);
const PlatformOrdersPage = lazy(() =>
  import('@/features/platform-admin-commercial').then((m) => ({ default: m.PlatformOrdersPage })),
);
const PlatformOrderDetailPage = lazy(() =>
  import('@/features/platform-admin-commercial').then((m) => ({
    default: m.PlatformOrderDetailPage,
  })),
);
const PlatformSettlementsPage = lazy(() =>
  import('@/features/platform-admin-commercial').then((m) => ({
    default: m.PlatformSettlementsPage,
  })),
);
const PlatformDisputesPage = lazy(() =>
  import('@/features/platform-admin-governance').then((m) => ({ default: m.PlatformDisputesPage })),
);
const PlatformDisputeDetailPage = lazy(() =>
  import('@/features/platform-admin-governance').then((m) => ({
    default: m.PlatformDisputeDetailPage,
  })),
);
const PlatformAnalyticsPage = lazy(() =>
  import('@/features/platform-admin-governance').then((m) => ({
    default: m.PlatformAnalyticsPage,
  })),
);
const PlatformAuditPage = lazy(() =>
  import('@/features/platform-admin-governance').then((m) => ({ default: m.PlatformAuditPage })),
);

const router = createBrowserRouter([
  { path: ROUTES.public.landing, element: <LandingPage /> },
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
        element: <RoleGuard allow="member" />,
        children: [
          {
            element: <MemberLayout />,
            children: [
              { path: ROUTES.member.root, element: <MemberDashboardPage /> },
              { path: ROUTES.member.profile, element: <PersonalProfilePage /> },
              { path: ROUTES.member.profileEdit, element: <EditPersonalProfilePage /> },
              { path: ROUTES.member.profileSetup, element: <ProfileSetupPage /> },
              { path: ROUTES.member.profileSecurity, element: <AccountSecurityPage /> },
              { path: ROUTES.member.profileAssessments, element: <AssessmentHistoryPage /> },
              { path: ROUTES.member.profileAssessment, element: <AssessmentDetailPage /> },
              { path: ROUTES.member.profileAppointments, element: <PTAppointmentsPage /> },
              { path: ROUTES.member.profileWearables, element: <WearableConnectionsPage /> },
              {
                path: ROUTES.member.profileNotifications,
                element: <MemberNotificationsPage />,
              },
              { path: ROUTES.member.coaching, element: <MemberCoachingPage /> },
              { path: ROUTES.member.workout, element: <MemberWorkoutPage /> },
              { path: ROUTES.member.workoutSchedule, element: <WeeklySchedule /> },
              { path: ROUTES.member.workoutBuilder, element: <MemberWorkoutBuilder /> },
              { path: ROUTES.member.aiAssessment, element: <AIAssessmentPage /> },
              { path: ROUTES.member.aiAssessmentExercise, element: <AIAssessmentPage /> },
              { path: ROUTES.member.workoutDay, element: <TrainingDayDetail /> },
              { path: ROUTES.member.workoutExecution, element: <WorkoutExecutionEntry /> },
              { path: ROUTES.member.workoutSession, element: <WorkoutExecution /> },
              { path: ROUTES.member.progress, element: <WorkoutProgress /> },
              { path: ROUTES.member.workoutHistory, element: <WorkoutHistory /> },
              { path: ROUTES.member.achievements, element: <AchievementsPage /> },
              { path: ROUTES.member.workoutCompletion, element: <WorkoutCompletion /> },
              { path: ROUTES.member.marketplace, element: <MarketplaceHome /> },
              { path: ROUTES.member.marketplaceGym, element: <GymDetailPage /> },
              { path: ROUTES.member.marketplaceOffers, element: <GymOffersPage /> },
              { path: ROUTES.member.marketplaceTrainers, element: <TrainerDiscoveryPage /> },
              { path: ROUTES.member.marketplaceTrainer, element: <TrainerDetailPage /> },
              { path: ROUTES.member.marketplacePackages, element: <PTPackagesPage /> },
              { path: ROUTES.member.marketplaceCheckout, element: <MarketplaceCheckoutPage /> },
              {
                path: ROUTES.member.marketplacePaymentResult,
                element: <MarketplacePaymentResultPage />,
              },
            ],
          },
        ],
      },
      {
        element: <RoleGuard allow="pt" />,
        children: [
          {
            element: <TrainerLayout />,
            children: [
              { path: ROUTES.pt.root, element: <PTDashboardPage /> },
              { path: ROUTES.pt.memberData, element: <TrainerMemberDataPage /> },
              { path: ROUTES.pt.profile, element: <TrainerProfilePage /> },
              { path: ROUTES.pt.profileEdit, element: <EditTrainerProfilePage /> },
              { path: ROUTES.pt.gymInfo, element: <TrainerGymInformationPage /> },
              { path: ROUTES.pt.members, element: <PTMembersPage /> },
              { path: ROUTES.pt.memberDetail, element: <TrainerMemberDetailPage /> },
              { path: ROUTES.pt.appointments, element: <TrainerAppointmentsPage /> },
              { path: ROUTES.pt.exerciseLibrary, element: <TrainerExerciseLibraryPage /> },
              { path: ROUTES.pt.planBuilder, element: <PlanBuilderPage /> },
              { path: ROUTES.pt.memberWorkout, element: <TrainerMemberWorkoutPage /> },
              { path: ROUTES.pt.coachingHistory, element: <TrainerCoachingHistoryPage /> },
              { path: ROUTES.pt.income, element: <TrainerIncomePage /> },
            ],
          },
        ],
      },
      {
        element: <RoleGuard allow="gym_admin" />,
        children: [
          {
            element: <GymOwnerLayout />,
            children: [
              {
                path: ROUTES.admin.onboarding,
                element: <GymOwnerOnboardingEntryPage />,
              },
              {
                element: <GymOwnerEditableGuard />,
                children: [
                  {
                    path: ROUTES.admin.onboardingProfile,
                    element: <GymOwnerBrandBranchPage />,
                  },
                  {
                    path: ROUTES.admin.onboardingLicense,
                    element: <GymOwnerLicensePage />,
                  },
                  {
                    path: ROUTES.admin.onboardingReview,
                    element: <GymOwnerReviewPage />,
                  },
                ],
              },
              {
                path: ROUTES.admin.onboardingStatus,
                element: <GymOwnerApprovalStatusPage />,
              },
              {
                element: <GymOwnerApprovalGuard />,
                children: [
                  { path: ROUTES.admin.root, element: <AdminDashboardPage /> },
                  {
                    path: ROUTES.admin.profile,
                    element: <GymOwnerProfileOverviewPage />,
                  },
                  {
                    path: ROUTES.admin.profileBrand,
                    element: <GymOwnerBrandProfilePage />,
                  },
                  {
                    path: ROUTES.admin.profileBranches,
                    element: <GymOwnerBranchesPage />,
                  },
                  { path: ROUTES.admin.pts, element: <GymOwnerTrainerListPage /> },
                  {
                    path: ROUTES.admin.trainerCreate,
                    element: <GymOwnerTrainerFormPage mode="create" />,
                  },
                  {
                    path: ROUTES.admin.trainerAssignments,
                    element: <GymOwnerAssignmentExceptionsPage />,
                  },
                  {
                    path: ROUTES.admin.trainerEdit,
                    element: <GymOwnerTrainerFormPage mode="edit" />,
                  },
                  {
                    path: ROUTES.admin.trainerDetail,
                    element: <GymOwnerTrainerDetailPage />,
                  },
                  {
                    path: ROUTES.admin.packages,
                    element: <GymOwnerPTPackageListPage />,
                  },
                  {
                    path: ROUTES.admin.packageCreate,
                    element: <GymOwnerPTPackageFormPage mode="create" />,
                  },
                  {
                    path: ROUTES.admin.packageEdit,
                    element: <GymOwnerPTPackageFormPage mode="edit" />,
                  },
                  {
                    path: ROUTES.admin.packageDetail,
                    element: <GymOwnerPTPackageDetailPage />,
                  },
                  {
                    path: ROUTES.admin.customers,
                    element: <GymOwnerCustomersPage />,
                  },
                  {
                    path: ROUTES.admin.orders,
                    element: <GymOwnerOrdersPage />,
                  },
                  {
                    path: ROUTES.admin.orderDetail,
                    element: <GymOwnerOrderDetailPage />,
                  },
                  {
                    path: ROUTES.admin.settlements,
                    element: <GymOwnerSettlementsPage />,
                  },
                  {
                    path: ROUTES.admin.analytics,
                    element: <GymOwnerAnalyticsPage />,
                  },
                  {
                    path: ROUTES.admin.notifications,
                    element: <GymOwnerNotificationsPage />,
                  },
                  {
                    path: ROUTES.admin.accountSecurity,
                    element: <GymOwnerAccountSecurityPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        element: <RoleGuard allow="super_admin" />,
        children: [
          {
            element: <PlatformAdminLayout />,
            children: [
              { path: ROUTES.superadmin.root, element: <SuperAdminDashboardPage /> },
              { path: ROUTES.superadmin.tenants, element: <SuperAdminTenantsPage /> },
              { path: ROUTES.superadmin.analytics, element: <SuperAdminAnalyticsPage /> },
              {
                path: ROUTES.superadmin.movementAssessment,
                element: <MovementAssessmentPage />,
              },
              {
                path: ROUTES.superadmin.movementReferenceSet,
                element: <MovementReferenceSetPage />,
              },
              { path: ROUTES.superadmin.gymApplications, element: <PlatformGymApplicationsPage /> },
              {
                path: ROUTES.superadmin.gymApplicationDetail,
                element: <PlatformGymApplicationDetailPage />,
              },
              { path: ROUTES.superadmin.activeGyms, element: <PlatformGymsPage /> },
              { path: ROUTES.superadmin.activeGymDetail, element: <PlatformGymDetailPage /> },
              { path: ROUTES.superadmin.legalChanges, element: <PlatformLegalChangesPage /> },
              {
                path: ROUTES.superadmin.legalChangeDetail,
                element: <PlatformLegalChangeDetailPage />,
              },
              {
                path: ROUTES.superadmin.trainerApplications,
                element: <PlatformTrainerApplicationsPage />,
              },
              {
                path: ROUTES.superadmin.trainerApplicationDetail,
                element: <PlatformTrainerApplicationDetailPage />,
              },
              { path: ROUTES.superadmin.accounts, element: <PlatformAccountsPage /> },
              { path: ROUTES.superadmin.listings, element: <PlatformListingsPage /> },
              { path: ROUTES.superadmin.listingDetail, element: <PlatformListingDetailPage /> },
              { path: ROUTES.superadmin.campaigns, element: <PlatformCampaignsPage /> },
              { path: ROUTES.superadmin.campaignCreate, element: <PlatformCampaignFormPage /> },
              { path: ROUTES.superadmin.campaignEdit, element: <PlatformCampaignFormPage /> },
              { path: ROUTES.superadmin.campaignDetail, element: <PlatformCampaignDetailPage /> },
              { path: ROUTES.superadmin.notifications, element: <PlatformNotificationsPage /> },
              { path: ROUTES.superadmin.commercial, element: <PlatformCommercialConfigPage /> },
              { path: ROUTES.superadmin.orders, element: <PlatformOrdersPage /> },
              { path: ROUTES.superadmin.orderDetail, element: <PlatformOrderDetailPage /> },
              { path: ROUTES.superadmin.settlements, element: <PlatformSettlementsPage /> },
              { path: ROUTES.superadmin.disputes, element: <PlatformDisputesPage /> },
              { path: ROUTES.superadmin.disputeDetail, element: <PlatformDisputeDetailPage /> },
              { path: ROUTES.superadmin.platformAnalytics, element: <PlatformAnalyticsPage /> },
              { path: ROUTES.superadmin.audit, element: <PlatformAuditPage /> },
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
