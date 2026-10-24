import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Building2,
  CalendarCheck,
  Camera,
  Check,
  CircleAlert,
  ClipboardCheck,
  Copy,
  GitBranch,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  UserRoundCog,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  TRAINER_SPECIALIZATIONS,
  type GymTrainerInput,
  type TrainerOperationalStatus,
} from '../model/types';
import { useGymOwnerTrainingStore } from '../model/useGymOwnerTrainingStore';

import { gymOwnerTrainingCopy } from './copy';
import { ManagementState } from './ManagementState';
import { ApprovalBadge, DetailRow, OperationalBadge, TrainerAvatar } from './TrainingShared';

import {
  marketplaceApi,
  type CreateGymTrainerResponse,
  type GymBranchCardView,
  type GymTrainerOverviewDto,
  type GymTrainersLeaderboardDto,
} from '@/features/marketplace/api/marketplaceApi';
import { ROUTES } from '@/shared/config/constants';
import { useActionRollback } from '@/shared/hooks/useActionRollback';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

import './gym-owner-training.css';

function useTrainingCopy() {
  const { language, locale } = useLocale();
  return { copy: gymOwnerTrainingCopy[language], locale, isVi: language === 'vi' };
}

export function GymOwnerTrainerListPage() {
  const { copy, isVi } = useTrainingCopy();
  const { executeWithRollback } = useActionRollback();
  const storeTrainers = useGymOwnerTrainingStore((state) => state.trainers);
  const assignments = useGymOwnerTrainingStore((state) => state.assignments);
  const openExceptions = useGymOwnerTrainingStore(
    (state) => state.assignmentExceptions.filter((item) => item.status === 'open').length,
  );

  // Real backend data states
  const [overview, setOverview] = useState<GymTrainersLeaderboardDto | null>(null);
  const [branches, setBranches] = useState<GymBranchCardView[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create PT modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createPrimaryBranchId, setCreatePrimaryBranchId] = useState('');
  const [createAdditionalBranchIds, setCreateAdditionalBranchIds] = useState<string[]>([]);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState('');

  // Credentials dialog states
  const [createdCredentials, setCreatedCredentials] = useState<CreateGymTrainerResponse | null>(
    null,
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Manual branch reassignment states
  const [branchModalTrainer, setBranchModalTrainer] = useState<GymTrainerOverviewDto | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [isSavingBranches, setIsSavingBranches] = useState(false);

  // Safe unlink modal states
  const [unlinkTarget, setUnlinkTarget] = useState<GymTrainerOverviewDto | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewData, myBrands] = await Promise.all([
        marketplaceApi.getGymTrainersOverview().catch(() => null),
        marketplaceApi.getMyBrands().catch(() => []),
      ]);

      if (overviewData) {
        setOverview(overviewData);
      }

      const firstBrand = myBrands[0];
      if (firstBrand) {
        const brandBranches = await marketplaceApi.getBrandBranches(firstBrand.id).catch(() => []);
        setBranches(brandBranches);
        const firstBranch = brandBranches[0];
        if (firstBranch && !createPrimaryBranchId) {
          setCreatePrimaryBranchId(firstBranch.id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch overview data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [createPrimaryBranchId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle Quick Create PT
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim() || !createEmail.includes('@')) {
      setCreateError(
        isVi ? 'Vui lòng nhập email hợp lệ (vd: trainer@gmail.com)' : 'Please enter a valid email.',
      );
      return;
    }
    if (!createFullName.trim()) {
      setCreateError(isVi ? 'Vui lòng nhập họ và tên huấn luyện viên' : 'Please enter full name.');
      return;
    }
    if (!createPrimaryBranchId) {
      setCreateError(
        isVi ? 'Vui lòng chọn cơ sở làm việc chính' : 'Please select a primary branch.',
      );
      return;
    }

    setCreateError('');
    setIsSubmittingCreate(true);
    try {
      const result = await marketplaceApi.createGymTrainer({
        email: createEmail.trim(),
        fullName: createFullName.trim(),
        branchId: createPrimaryBranchId,
        additionalBranchIds: createAdditionalBranchIds,
      });

      setIsCreateOpen(false);
      setCreateEmail('');
      setCreateFullName('');
      setCreateAdditionalBranchIds([]);
      setCreatedCredentials(result);
      toast.success(
        isVi ? 'Đã tạo tài khoản Huấn luyện viên thành công!' : 'Trainer created successfully!',
      );
      void loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể tạo tài khoản huấn luyện viên.'
            : 'Failed to create trainer.';
      setCreateError(message);
      toast.error(message);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(isVi ? 'Đã sao chép vào bộ nhớ tạm!' : 'Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Toggle Trainer Active Status (with Rollback mechanism)
  const handleToggleStatus = async (trainer: GymTrainerOverviewDto) => {
    const previousStatus = trainer.isActive;
    const nextStatus = !previousStatus;
    try {
      await executeWithRollback({
        actionName: isVi
          ? `${nextStatus ? 'Kích hoạt' : 'Tạm dừng'} PT ${trainer.fullName}`
          : `${nextStatus ? 'Activate' : 'Suspend'} PT ${trainer.fullName}`,
        execute: async () => {
          await marketplaceApi.updateTrainerStatus(trainer.trainerProfileId, nextStatus);
        },
        rollback: async () => {
          await marketplaceApi.updateTrainerStatus(trainer.trainerProfileId, previousStatus);
        },
        successMessage: nextStatus
          ? isVi
            ? `Đã kích hoạt hoạt động của PT ${trainer.fullName}`
            : `Activated ${trainer.fullName}`
          : isVi
            ? `Đã tạm ngưng hoạt động của PT ${trainer.fullName}`
            : `Suspended ${trainer.fullName}`,
        rollbackSuccessMessage: isVi
          ? `Đã hoàn tác: Khôi phục trạng thái hoạt động của PT ${trainer.fullName}!`
          : `Restored status for ${trainer.fullName}!`,
        onAfterRollback: () => {
          void loadData();
        },
      });
      void loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể cập nhật trạng thái.'
            : 'Failed to update status.';
      toast.error(message);
    }
  };

  // Open Branch Assignment Modal
  const openBranchModal = (trainer: GymTrainerOverviewDto) => {
    setBranchModalTrainer(trainer);
    setSelectedBranchIds(trainer.assignedBranches.map((b) => b.branchId));
  };

  // Save Branch Assignment (with Rollback mechanism)
  const handleSaveBranches = async () => {
    if (!branchModalTrainer) return;
    if (selectedBranchIds.length === 0) {
      toast.error(
        isVi
          ? 'Huấn luyện viên phải trực thuộc ít nhất 1 chi nhánh.'
          : 'Trainer must belong to at least 1 branch.',
      );
      return;
    }
    const targetTrainer = branchModalTrainer;
    const previousBranchIds = targetTrainer.assignedBranches.map((b) => b.branchId);
    const newBranchIds = [...selectedBranchIds];

    setIsSavingBranches(true);
    try {
      await executeWithRollback({
        actionName: isVi
          ? `Phân bổ chi nhánh cho PT ${targetTrainer.fullName}`
          : `Reassign branches for ${targetTrainer.fullName}`,
        execute: async () => {
          await marketplaceApi.updateTrainerBranches(targetTrainer.trainerProfileId, newBranchIds);
        },
        rollback: async () => {
          await marketplaceApi.updateTrainerBranches(
            targetTrainer.trainerProfileId,
            previousBranchIds,
          );
        },
        successMessage: isVi
          ? 'Đã cập nhật phân bổ chi nhánh thành công!'
          : 'Branches updated successfully!',
        rollbackSuccessMessage: isVi
          ? `Đã hoàn tác: Khôi phục phân bổ chi nhánh cũ cho PT ${targetTrainer.fullName}!`
          : `Restored branch assignments for ${targetTrainer.fullName}!`,
        onAfterRollback: () => {
          void loadData();
        },
      });
      setBranchModalTrainer(null);
      void loadData();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể cập nhật chi nhánh.'
            : 'Failed to update branches.';
      toast.error(message);
    } finally {
      setIsSavingBranches(false);
    }
  };

  // Execute Safe Unlink (with Rollback mechanism)
  const handleExecuteUnlink = async () => {
    if (!unlinkTarget) return;
    const targetTrainer = unlinkTarget;
    setIsUnlinking(true);
    setUnlinkError(null);
    try {
      await executeWithRollback({
        actionName: isVi
          ? `Hủy liên kết PT ${targetTrainer.fullName}`
          : `Unlink PT ${targetTrainer.fullName}`,
        execute: async () => {
          await marketplaceApi.unlinkTrainer(targetTrainer.trainerProfileId);
        },
        rollback: async () => {
          await marketplaceApi.relinkTrainer(targetTrainer.trainerProfileId);
        },
        successMessage: isVi
          ? `Đã hủy liên kết PT ${targetTrainer.fullName} khỏi thương hiệu gym.`
          : `Unlinked ${targetTrainer.fullName}.`,
        rollbackSuccessMessage: isVi
          ? `Đã hoàn tác: Khôi phục liên kết PT ${targetTrainer.fullName} thành công!`
          : `Restored link for ${targetTrainer.fullName}!`,
        onAfterRollback: () => {
          void loadData();
        },
      });
      setUnlinkTarget(null);
      void loadData();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isVi
            ? 'Không thể hủy liên kết huấn luyện viên.'
            : 'Failed to unlink trainer.';
      setUnlinkError(msg);
      toast.error(msg);
    } finally {
      setIsUnlinking(false);
    }
  };

  const trainersList = overview?.trainers ?? [];
  const topPT = overview?.topBookedTrainer;

  return (
    <WorkspacePage width="wide" className="gym-training-page">
      <h1 className="sr-only">{copy.trainerList}</h1>

      {/* Top Action Toolbar */}
      <div className="gym-training-toolbar">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link to={ROUTES.admin.trainerAssignments}>
              <ClipboardCheck aria-hidden="true" size={16} />
              {copy.assignmentExceptions}
              {openExceptions > 0 ? <Badge variant="destructive">{openExceptions}</Badge> : null}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.admin.trainerServices}>
              <Plus aria-hidden="true" size={16} />
              {isVi ? 'Dịch vụ Trainer' : 'Trainer services'}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.admin.invitations}>
              <Mail aria-hidden="true" size={16} />
              {isVi ? 'Mời nhân sự' : 'Invite staff'}
            </Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.admin.trainerCreate}>
              <Plus aria-hidden="true" size={16} />
              {copy.createTrainer}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void loadData()} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isVi ? 'Làm mới' : 'Refresh'}
          </Button>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary font-semibold">
          <Plus aria-hidden="true" size={16} />
          {isVi ? 'Thêm Huấn luyện viên mới' : 'Add New PT'}
        </Button>
      </div>

      {/* ── PT Leaderboard & Overview Spotlight ─────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Spotlight Card: Top Booked PT */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Trophy size={16} className="fill-amber-500 text-amber-500" />
              {isVi
                ? 'Top Huấn luyện viên được đặt lịch nhiều nhất'
                : 'Most Booked Personal Trainer'}
            </span>
            <Badge
              variant="neutral"
              className="border-amber-500/50 bg-amber-500/10 text-xs font-semibold text-amber-700 dark:text-amber-300"
            >
              ⭐ {topPT ? `${topPT.averageRating.toFixed(1)} / 5.0` : '5.0 / 5.0'}
            </Badge>
          </div>

          {topPT ? (
            <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <TrainerAvatar name={topPT.fullName} source={topPT.avatarUrl} large />
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                    {topPT.fullName}
                    {topPT.isProfileComplete ? (
                      <Badge
                        variant="neutral"
                        className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600"
                      >
                        {isVi ? 'Đã kích hoạt' : 'Active'}
                      </Badge>
                    ) : (
                      <Badge
                        variant="neutral"
                        className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600"
                      >
                        {isVi ? 'Hồ sơ sơ cấp' : 'Basic Profile'}
                      </Badge>
                    )}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {topPT.email} {topPT.phoneNumber ? `• ${topPT.phoneNumber}` : ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {topPT.assignedBranches.map((b) => (
                      <span
                        key={b.branchId}
                        className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        <Building2 size={11} className="text-muted-foreground" />
                        {b.branchName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid w-full grid-cols-3 gap-3 rounded-xl border border-border bg-background/80 p-3 backdrop-blur sm:w-auto">
                <div className="px-2 text-center">
                  <span className="block text-[11px] text-muted-foreground">
                    {isVi ? 'Buổi hoàn thành' : 'Completed'}
                  </span>
                  <strong className="font-data text-lg font-bold text-foreground">
                    {topPT.completedSessionsCount}
                  </strong>
                </div>
                <div className="border-x border-border px-2 text-center">
                  <span className="block text-[11px] text-muted-foreground">
                    {isVi ? 'Lịch sắp tới' : 'Upcoming'}
                  </span>
                  <strong className="font-data text-lg font-bold text-primary">
                    {topPT.scheduledSessionsCount}
                  </strong>
                </div>
                <div className="px-2 text-center">
                  <span className="block text-[11px] text-muted-foreground">
                    {isVi ? 'Học viên kèm' : 'Clients'}
                  </span>
                  <strong className="font-data text-lg font-bold text-emerald-600">
                    {topPT.activeClientsCount}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 py-6 text-center text-sm text-muted-foreground">
              <UsersRound className="mx-auto mb-2 opacity-40" size={32} />
              {isVi ? 'Chưa có dữ liệu đặt lịch cho huấn luyện viên.' : 'No booking data yet.'}
            </div>
          )}
        </div>

        {/* Aggregate KPI summary cards */}
        <div className="grid grid-rows-3 gap-3">
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <UsersRound size={20} />
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">
                  {isVi ? 'Tổng số Huấn luyện viên' : 'Total Trainers'}
                </span>
                <strong className="font-data text-xl font-bold text-foreground">
                  {overview?.totalTrainers ?? trainersList.length}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600">
                <UserCheck size={20} />
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">
                  {isVi ? 'Đang hoạt động nhận ca' : 'Active Trainers'}
                </span>
                <strong className="font-data text-xl font-bold text-emerald-600">
                  {overview?.activeTrainers ?? 0}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">
                  {isVi ? 'Hồ sơ chưa hoàn thiện' : 'Incomplete Profiles'}
                </span>
                <strong className="font-data text-xl font-bold text-amber-600">
                  {overview?.incompleteProfilesCount ?? 0}
                </strong>
                <p className="text-[10px] text-muted-foreground">
                  {isVi ? 'Hệ thống sẽ ép điền khi PT đăng nhập' : 'Enforced on login'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Trainer List Table ─────────────────────────────────────────── */}
      <WorkspacePanel className="gym-training-list-panel mt-2">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isVi ? 'Danh sách Huấn luyện viên trực thuộc hệ thống' : 'Affiliated Trainers List'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isVi
                ? 'Quản lý tài khoản, trạng thái hoạt động và phân bổ chi nhánh làm việc'
                : 'Manage accounts, operational status and branch assignments'}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {isVi
              ? `Hiển thị ${trainersList.length} HLV`
              : `Showing ${trainersList.length} trainers`}
          </span>
        </div>

        <ManagementState
          state={isLoading && storeTrainers.length === 0 ? 'loading' : 'loaded'}
          isEmpty={trainersList.length === 0 && storeTrainers.length === 0}
          loadingLabel={copy.loading}
          emptyLabel={
            isVi
              ? 'Chưa có huấn luyện viên nào. Hãy bấm "Thêm Huấn luyện viên mới" để cấp tài khoản.'
              : copy.noTrainers
          }
          errorLabel={copy.listError}
        >
          {trainersList.length > 0 ? (
            <div className="divide-y divide-border">
              {trainersList.map((trainer) => (
                <article
                  key={trainer.trainerProfileId}
                  className="flex flex-col justify-between gap-4 p-4 transition hover:bg-muted/30 md:flex-row md:items-center"
                >
                  {/* Identity */}
                  <div className="flex min-w-[240px] items-center gap-3">
                    <TrainerAvatar name={trainer.fullName} source={trainer.avatarUrl} />
                    <div>
                      <strong className="block text-sm font-semibold text-foreground">
                        {trainer.fullName}
                      </strong>
                      <span className="block text-xs text-muted-foreground">{trainer.email}</span>
                      {trainer.phoneNumber ? (
                        <span className="text-xs text-muted-foreground">{trainer.phoneNumber}</span>
                      ) : (
                        <span className="text-[11px] italic text-amber-600">
                          {isVi ? 'Chưa cập nhật SĐT' : 'No phone'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Branches */}
                  <div className="min-w-[200px] flex-1">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {isVi ? 'Cơ sở phân bổ' : 'Assigned Branches'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {trainer.assignedBranches.length > 0 ? (
                        trainer.assignedBranches.map((b) => (
                          <span
                            key={b.branchId}
                            className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                          >
                            <Building2 size={12} className="text-muted-foreground" />
                            {b.branchName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-amber-600">
                          {isVi ? 'Chưa phân cơ sở' : 'Unassigned'}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-xs text-primary hover:text-primary"
                        onClick={() => openBranchModal(trainer)}
                      >
                        <GitBranch size={12} className="mr-1" />
                        {isVi ? 'Đổi chi nhánh' : 'Change'}
                      </Button>
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="min-w-[130px]">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {isVi ? 'Hồ sơ chuyên môn' : 'Profile Status'}
                    </span>
                    {trainer.isProfileComplete ? (
                      <Badge
                        variant="neutral"
                        className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-600"
                      >
                        <Check size={12} className="mr-1" />
                        {isVi ? 'Đã hoàn tất' : 'Complete'}
                      </Badge>
                    ) : (
                      <Badge
                        variant="neutral"
                        className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-600"
                      >
                        <AlertTriangle size={12} className="mr-1" />
                        {isVi ? 'Chưa hoàn tất (Ép điền)' : 'Incomplete'}
                      </Badge>
                    )}
                  </div>

                  {/* Status Toggle & Metrics */}
                  <div className="flex min-w-[120px] items-center gap-4">
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {isVi ? 'Vận hành' : 'Status'}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleToggleStatus(trainer)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                          trainer.isActive
                            ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${trainer.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`}
                        />
                        {trainer.isActive
                          ? isVi
                            ? 'Hoạt động'
                            : 'Active'
                          : isVi
                            ? 'Tạm dừng'
                            : 'Disabled'}
                      </button>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => {
                        setUnlinkTarget(trainer);
                        setUnlinkError(null);
                      }}
                    >
                      <Trash2 size={14} className="mr-1" />
                      {isVi ? 'Hủy liên kết' : 'Unlink'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="gym-trainer-list">
              {storeTrainers.map((trainer) => {
                const assignedCount = assignments.filter(
                  (assignment) =>
                    assignment.trainerId === trainer.id && assignment.status === 'active',
                ).length;
                return (
                  <article
                    key={trainer.id}
                    className="flex flex-col justify-between gap-4 p-4 transition hover:bg-muted/30 md:flex-row md:items-center"
                  >
                    <div className="flex min-w-[240px] items-center gap-3">
                      <TrainerAvatar name={trainer.fullName} source={trainer.avatarDataUrl} />
                      <div>
                        <strong className="block text-sm font-semibold text-foreground">
                          {trainer.fullName}
                        </strong>
                        <span className="block text-xs text-muted-foreground">{trainer.email}</span>
                      </div>
                    </div>
                    <div className="gym-training-chip-list">
                      {trainer.specializations.slice(0, 2).map((specialization) => (
                        <span
                          key={specialization}
                          className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                        >
                          {copy.specializationsMap[specialization]}
                        </span>
                      ))}
                    </div>
                    <div>
                      <ApprovalBadge status={trainer.approvalStatus} copy={copy} />
                    </div>
                    <div>
                      <OperationalBadge status={trainer.operationalStatus} copy={copy} />
                    </div>
                    <strong className="gym-training-assignment-count text-xs">
                      {assignedCount}
                    </strong>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={ROUTES.admin.trainerDetailPath(trainer.id)}>{copy.viewDetail}</Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </ManagementState>
      </WorkspacePanel>

      {/* ── Modal 1: Quick Create PT ────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="text-primary" size={20} />
              {isVi ? 'Thêm Huấn luyện viên mới' : 'Create Trainer Account'}
            </DialogTitle>
            <DialogDescription>
              {isVi
                ? 'Chủ phòng gym chỉ cần nhập thông tin cơ bản và phân bổ cơ sở làm việc. Hệ thống sẽ tự động tạo tài khoản và sinh mật khẩu ngẫu nhiên cho huấn luyện viên.'
                : 'Enter basic details and branch assignment. System will auto-generate login credentials.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => void handleCreateSubmit(e)} className="space-y-4 py-2">
            <div>
              <Label htmlFor="pt-email">{isVi ? 'Gmail / Email đăng ký (*)' : 'Email (*)'}</Label>
              <Input
                id="pt-email"
                type="email"
                placeholder="vd: trainer.nguyen@gmail.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
              />
              <span className="text-[11px] text-muted-foreground">
                {isVi
                  ? 'Hệ thống sẽ dùng email này làm tài khoản đăng nhập.'
                  : 'Will be used as login username.'}
              </span>
            </div>

            <div>
              <Label htmlFor="pt-name">
                {isVi ? 'Họ và tên huấn luyện viên (*)' : 'Full Name (*)'}
              </Label>
              <Input
                id="pt-name"
                placeholder="vd: Nguyễn Văn Hùng"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="pt-branch">
                {isVi ? 'Chi nhánh làm việc chính (*)' : 'Primary Branch (*)'}
              </Label>
              {branches.length > 0 ? (
                <select
                  id="pt-branch"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={createPrimaryBranchId}
                  onChange={(e) => setCreatePrimaryBranchId(e.target.value)}
                  required
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchName} — {b.addressLine1}, {b.city}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs italic text-amber-600">
                  {isVi
                    ? 'Đang tải danh sách cơ sở hoặc bạn chưa tạo chi nhánh nào.'
                    : 'Loading branches...'}
                </p>
              )}
            </div>

            {branches.length > 1 && (
              <div>
                <Label className="mb-2 block">
                  {isVi ? 'Các chi nhánh hỗ trợ khác (tùy chọn)' : 'Additional Branches'}
                </Label>
                <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {branches
                    .filter((b) => b.id !== createPrimaryBranchId)
                    .map((b) => (
                      <label key={b.id} className="flex cursor-pointer items-center gap-2 text-xs">
                        <Checkbox
                          checked={createAdditionalBranchIds.includes(b.id)}
                          onChange={() =>
                            setCreateAdditionalBranchIds((prev) =>
                              prev.includes(b.id)
                                ? prev.filter((id) => id !== b.id)
                                : [...prev, b.id],
                            )
                          }
                        />
                        <span>{b.branchName}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold">
                {isVi ? '💡 Cơ chế tự điền hồ sơ (Ép điền):' : '💡 Enforced Profile Setup:'}
              </p>
              <p className="mt-0.5">
                {isVi
                  ? 'Chủ phòng gym không cần nhập kinh nghiệm hay bio. Khi PT đăng nhập lần đầu, hệ thống sẽ bắt buộc PT điền đầy đủ hồ sơ trước khi nhận học viên.'
                  : 'Owner does not need to fill bio/experience. PT will be forced to complete profile upon first login.'}
              </p>
            </div>

            {createError && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {createError}
              </p>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                {copy.cancel}
              </Button>
              <Button type="submit" disabled={isSubmittingCreate} className="gap-2">
                {isSubmittingCreate ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    {isVi ? 'Đang tạo...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    {isVi ? 'Tạo tài khoản PT' : 'Create Trainer'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal 2: Generated Credentials Dialog ───────────────────────────── */}
      <Dialog
        open={Boolean(createdCredentials)}
        onOpenChange={(open) => !open && setCreatedCredentials(null)}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Check className="rounded-full bg-emerald-100 p-1 text-emerald-600" size={24} />
              {isVi ? 'Tài khoản Huấn luyện viên đã sẵn sàng' : 'Trainer Credentials Created'}
            </DialogTitle>
            <DialogDescription>
              {isVi
                ? 'Hệ thống đã tự động kích hoạt tài khoản PT và sinh mật khẩu tạm thời. Hãy sao chép thông tin này để bàn giao cho huấn luyện viên.'
                : 'Account created with auto-generated temporary password. Please copy and provide it to the trainer.'}
            </DialogDescription>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-3 py-2">
              <div className="space-y-2.5 rounded-xl border bg-muted/60 p-4">
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                    {isVi ? 'Họ và tên PT' : 'Full Name'}
                  </span>
                  <strong className="text-sm font-semibold">{createdCredentials.fullName}</strong>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                    {isVi ? 'Tài khoản đăng nhập (Email)' : 'Username (Email)'}
                  </span>
                  <div className="mt-0.5 flex items-center justify-between">
                    <code className="rounded border bg-background px-2 py-1 font-mono text-xs">
                      {createdCredentials.email}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                    >
                      {copiedKey === 'email' ? (
                        <Check size={13} className="text-emerald-500" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                    {isVi ? 'Mật khẩu tạm thời' : 'Temporary Password'}
                  </span>
                  <div className="mt-0.5 flex items-center justify-between">
                    <code className="rounded border bg-background px-2 py-1 font-mono text-xs font-bold text-primary">
                      {createdCredentials.temporaryPassword}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        copyToClipboard(createdCredentials.temporaryPassword, 'password')
                      }
                    >
                      {copiedKey === 'password' ? (
                        <Check size={13} className="text-emerald-500" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                    {isVi ? 'Cơ sở phân bổ' : 'Assigned Branch'}
                  </span>
                  <span className="text-xs font-medium">
                    {createdCredentials.primaryBranchName}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                <p className="font-semibold">
                  {isVi ? '✅ Quy trình lần đầu đăng nhập:' : '✅ First login process:'}
                </p>
                <p className="mt-0.5">
                  {isVi
                    ? 'Khi PT đăng nhập bằng mật khẩu trên, hệ thống sẽ tự động ép PT hoàn tất hồ sơ cá nhân (Số điện thoại, Năm kinh nghiệm, Bio) trước khi mở lịch nhận học viên.'
                    : 'Trainer will be required to complete personal details upon first login.'}
                </p>
              </div>

              <Button
                className="w-full gap-2 font-semibold"
                onClick={() => {
                  const payload = `THÔNG TIN TÀI KHOẢN PT FITFLEX\n- Họ tên: ${createdCredentials.fullName}\n- Email: ${createdCredentials.email}\n- Mật khẩu: ${createdCredentials.temporaryPassword}\n- Cơ sở: ${createdCredentials.primaryBranchName}\n- Link đăng nhập: ${window.location.origin}/login`;
                  copyToClipboard(payload, 'all');
                }}
              >
                <Copy size={15} />
                {copiedKey === 'all'
                  ? isVi
                    ? 'Đã sao chép toàn bộ!'
                    : 'Copied all!'
                  : isVi
                    ? 'Sao chép toàn bộ thông tin đăng nhập'
                    : 'Copy All Credentials'}
              </Button>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{isVi ? 'Đóng' : 'Close'}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 3: Manual Branch Reassignment ──────────────────────────────── */}
      <Dialog
        open={Boolean(branchModalTrainer)}
        onOpenChange={(open) => !open && setBranchModalTrainer(null)}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="text-primary" size={20} />
              {isVi ? 'Phân bổ / Đổi chi nhánh làm việc' : 'Reassign Branches'}
            </DialogTitle>
            <DialogDescription>
              {isVi
                ? `Chọn các chi nhánh trong chuỗi mà huấn luyện viên ${branchModalTrainer?.fullName} được phép nhận ca dạy và học viên.`
                : `Select branches where trainer ${branchModalTrainer?.fullName} is eligible to train clients.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isVi ? 'Danh sách cơ sở trong chuỗi:' : 'Brand Branches:'}
            </Label>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border p-3">
              {branches.map((b) => {
                const isChecked = selectedBranchIds.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 transition ${
                      isChecked
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-border bg-background hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onChange={() =>
                        setSelectedBranchIds((prev) =>
                          prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id],
                        )
                      }
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="block text-xs font-semibold text-foreground">
                        {b.branchName}
                      </strong>
                      <span className="block text-[11px] text-muted-foreground">
                        {b.addressLine1}, {b.city}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBranchModalTrainer(null)}>
              {copy.cancel}
            </Button>
            <Button onClick={() => void handleSaveBranches()} disabled={isSavingBranches}>
              {isSavingBranches
                ? isVi
                  ? 'Đang lưu...'
                  : 'Saving...'
                : isVi
                  ? 'Lưu phân bổ chi nhánh'
                  : 'Save Assignments'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal 4: Safe Unlink Confirmation ───────────────────────────────── */}
      <Dialog open={Boolean(unlinkTarget)} onOpenChange={(open) => !open && setUnlinkTarget(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              {isVi ? 'Xác nhận hủy liên kết Huấn luyện viên?' : 'Confirm Unlink Trainer?'}
            </DialogTitle>
            <DialogDescription>
              {isVi
                ? `Bạn đang thao tác hủy liên kết huấn luyện viên ${unlinkTarget?.fullName} khỏi thương hiệu phòng gym.`
                : `Are you sure you want to unlink trainer ${unlinkTarget?.fullName}?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-200">
              <p className="font-semibold">
                {isVi
                  ? '⚠️ Kiểm tra an toàn trước khi xóa/hủy liên kết:'
                  : 'Safety validation check:'}
              </p>
              <p className="mt-1">
                {isVi
                  ? 'Hệ thống sẽ kiểm tra xem PT có lịch hẹn hoặc buổi tập sắp diễn ra nào không. Nếu có, thao tác sẽ bị chặn và bạn cần chuyển giao (reassign) các buổi tập sang huấn luyện viên khác trước.'
                  : 'System checks for active upcoming appointments before allowing unlink.'}
              </p>
            </div>

            {unlinkError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-medium text-destructive"
              >
                {unlinkError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkTarget(null)}>
              {copy.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleExecuteUnlink()}
              disabled={isUnlinking}
            >
              {isUnlinking
                ? isVi
                  ? 'Đang kiểm tra & xóa...'
                  : 'Processing...'
                : isVi
                  ? 'Xác nhận hủy liên kết'
                  : 'Confirm Unlink'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}

type TrainerFormDraft = GymTrainerInput;

const emptyTrainerForm: TrainerFormDraft = {
  fullName: '',
  email: '',
  phone: '',
  bio: '',
  specializations: [],
  experienceYears: 0,
  selfIntroduction: '',
  avatarDataUrl: null,
};

export function GymOwnerTrainerFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { copy } = useTrainingCopy();
  const { trainerId = '' } = useParams();
  const navigate = useNavigate();
  const trainer = useGymOwnerTrainingStore((state) =>
    state.trainers.find((item) => item.id === trainerId),
  );
  const createTrainer = useGymOwnerTrainingStore((state) => state.createTrainer);
  const updateTrainer = useGymOwnerTrainingStore((state) => state.updateTrainer);
  const [form, setForm] = useState<TrainerFormDraft>(() =>
    mode === 'edit' && trainer
      ? {
          fullName: trainer.fullName,
          email: trainer.email,
          phone: trainer.phone,
          bio: trainer.bio,
          specializations: [...trainer.specializations],
          experienceYears: trainer.experienceYears,
          selfIntroduction: trainer.selfIntroduction,
          avatarDataUrl: trainer.avatarDataUrl,
        }
      : emptyTrainerForm,
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (mode === 'edit' && (!trainer || !['draft', 'rejected'].includes(trainer.approvalStatus))) {
    return (
      <Navigate
        to={trainer ? ROUTES.admin.trainerDetailPath(trainer.id) : ROUTES.admin.pts}
        replace
      />
    );
  }

  const toggleSpecialization = (specialization: TrainerFormDraft['specializations'][number]) => {
    setForm((current) => ({
      ...current,
      specializations: current.specializations.includes(specialization)
        ? current.specializations.filter((item) => item !== specialization)
        : [...current.specializations, specialization],
    }));
  };

  const save = () => {
    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.bio.trim() ||
      form.experienceYears <= 0 ||
      form.specializations.length === 0
    ) {
      setError(copy.requiredTrainer);
      return;
    }
    setIsSaving(true);
    window.setTimeout(() => {
      const normalized: GymTrainerInput = {
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        selfIntroduction: form.selfIntroduction.trim(),
        specializations: [...form.specializations],
      };
      const savedId = mode === 'create' ? createTrainer(normalized) : trainer!.id;
      if (mode === 'edit') updateTrainer(trainer!.id, normalized);
      toast.success(mode === 'create' ? copy.createdTrainer : copy.savedTrainer);
      void navigate(ROUTES.admin.trainerDetailPath(savedId));
    }, 250);
  };

  return (
    <WorkspacePage className="gym-training-page">
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link
            to={
              mode === 'edit' && trainer
                ? ROUTES.admin.trainerDetailPath(trainer.id)
                : ROUTES.admin.pts
            }
          >
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.cancel}
          </Link>
        </Button>
      </div>
      <WorkspacePanel className="gym-training-form-shell">
        <aside className="gym-training-avatar-editor">
          <TrainerAvatar name={form.fullName || 'Trainer'} source={form.avatarDataUrl} large />
          <strong>{copy.avatar}</strong>
          <label>
            <Camera aria-hidden="true" size={16} />
            {copy.uploadAvatar}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (
                  !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                  file.size > 2_000_000
                ) {
                  setError(copy.invalidImage);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setForm((current) => ({ ...current, avatarDataUrl: reader.result as string }));
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <small>{copy.imageRule}</small>
        </aside>
        <div className="gym-training-form">
          <div className="gym-training-form-grid">
            <div className="gym-training-field">
              <Label htmlFor="trainer-name">{copy.fullName}</Label>
              <Input
                id="trainer-name"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-email">{copy.email}</Label>
              <Input
                id="trainer-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-phone">{copy.phone}</Label>
              <Input
                id="trainer-phone"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </div>
            <div className="gym-training-field">
              <Label htmlFor="trainer-experience">{copy.experience}</Label>
              <Input
                id="trainer-experience"
                type="number"
                min={1}
                value={form.experienceYears || ''}
                onChange={(event) =>
                  setForm({ ...form, experienceYears: Number(event.target.value) })
                }
              />
            </div>
            <div className="gym-training-field is-wide">
              <Label htmlFor="trainer-bio">{copy.bio}</Label>
              <Textarea
                id="trainer-bio"
                value={form.bio}
                onChange={(event) => setForm({ ...form, bio: event.target.value })}
              />
            </div>
            <div className="gym-training-field is-wide">
              <Label htmlFor="trainer-introduction">{copy.selfIntroduction}</Label>
              <Textarea
                id="trainer-introduction"
                value={form.selfIntroduction}
                onChange={(event) => setForm({ ...form, selfIntroduction: event.target.value })}
              />
            </div>
            <fieldset className="gym-training-specializations">
              <legend>{copy.specializations}</legend>
              <div>
                {TRAINER_SPECIALIZATIONS.map((specialization) => (
                  <label key={specialization}>
                    <Checkbox
                      checked={form.specializations.includes(specialization)}
                      onChange={() => toggleSpecialization(specialization)}
                    />
                    {copy.specializationsMap[specialization]}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          {error ? (
            <p className="gym-training-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="gym-training-form-actions">
            <Button variant="outline" onClick={() => navigate(-1)}>
              {copy.cancel}
            </Button>
            <Button onClick={save} disabled={isSaving}>
              {isSaving ? copy.saving : copy.save}
            </Button>
          </div>
        </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}

export function GymOwnerTrainerDetailPage() {
  const { copy, isVi } = useTrainingCopy();
  const { executeWithRollback } = useActionRollback();
  const { trainerId = '' } = useParams();
  const trainer = useGymOwnerTrainingStore((state) =>
    state.trainers.find((item) => item.id === trainerId),
  );
  const allAssignments = useGymOwnerTrainingStore((state) => state.assignments);
  const submitTrainer = useGymOwnerTrainingStore((state) => state.submitTrainer);
  const setTrainerOperationalStatus = useGymOwnerTrainingStore(
    (state) => state.setTrainerOperationalStatus,
  );
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<TrainerOperationalStatus | null>(null);

  if (!trainer) return <Navigate to={ROUTES.admin.pts} replace />;

  const assignments = allAssignments.filter((item) => item.trainerId === trainerId);

  const approvalBody = {
    draft: copy.draftBody,
    pending: copy.pendingBody,
    approved: copy.approvedBody,
    rejected: copy.rejectedBody,
  }[trainer.approvalStatus];

  const allowedStatusActions = (() => {
    if (trainer.approvalStatus !== 'approved' || !trainer.operationalStatus) return [];
    if (trainer.operationalStatus === 'unlinked') return [];
    if (trainer.operationalStatus === 'active') {
      return [
        { status: 'hidden' as const, label: copy.hideTrainer },
        { status: 'suspended' as const, label: copy.suspendTrainer },
        { status: 'unlinked' as const, label: copy.unlinkTrainer },
      ];
    }
    return [
      { status: 'active' as const, label: copy.restoreTrainer },
      { status: 'unlinked' as const, label: copy.unlinkTrainer },
    ];
  })();

  return (
    <WorkspacePage width="wide" className="gym-training-page">
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link to={ROUTES.admin.pts}>
            <ArrowLeft aria-hidden="true" size={16} /> {copy.back}
          </Link>
        </Button>
        <div>
          {['draft', 'rejected'].includes(trainer.approvalStatus) ? (
            <Button asChild variant="outline">
              <Link to={ROUTES.admin.trainerEditPath(trainer.id)}>{copy.edit}</Link>
            </Button>
          ) : null}
          {['draft', 'rejected'].includes(trainer.approvalStatus) ? (
            <Button onClick={() => setIsSubmitOpen(true)}>
              <ShieldCheck aria-hidden="true" size={16} />
              {trainer.approvalStatus === 'rejected' ? copy.resubmitApproval : copy.submitApproval}
            </Button>
          ) : null}
        </div>
      </div>

      <section className="gym-trainer-detail-hero">
        <TrainerAvatar name={trainer.fullName} source={trainer.avatarDataUrl} large />
        <div>
          <h1>{trainer.fullName}</h1>
          <div className="gym-training-chip-list">
            {trainer.specializations.map((specialization) => (
              <span key={specialization}>{copy.specializationsMap[specialization]}</span>
            ))}
          </div>
        </div>
        <dl>
          <div>
            <dt>{copy.approvalStatus}</dt>
            <dd>
              <ApprovalBadge status={trainer.approvalStatus} copy={copy} />
            </dd>
          </div>
          <div>
            <dt>{copy.operationalStatus}</dt>
            <dd>
              <OperationalBadge status={trainer.operationalStatus} copy={copy} />
            </dd>
          </div>
        </dl>
      </section>

      <section className={`gym-trainer-approval is-${trainer.approvalStatus}`}>
        {trainer.approvalStatus === 'rejected' ? (
          <CircleAlert aria-hidden="true" size={22} />
        ) : (
          <ShieldCheck aria-hidden="true" size={22} />
        )}
        <div>
          <strong>{copy.approval[trainer.approvalStatus]}</strong>
          <span>{approvalBody}</span>
          {trainer.rejectionReason ? (
            <p role="alert">
              <b>{copy.rejectionReason}:</b> {trainer.rejectionReason}
            </p>
          ) : null}
        </div>
      </section>

      <div className="gym-training-detail-grid">
        <WorkspacePanel>
          <div className="gym-training-section-head">
            <UserRoundCog size={18} />
            <h2>{copy.about}</h2>
          </div>
          <WorkspacePanelContent>
            <dl className="gym-training-detail-list">
              <DetailRow label={copy.bio}>{trainer.bio}</DetailRow>
              <DetailRow label={copy.selfIntroduction}>{trainer.selfIntroduction || '—'}</DetailRow>
              <DetailRow label={copy.experience}>
                {trainer.experienceYears} {copy.years}
              </DetailRow>
            </dl>
          </WorkspacePanelContent>
        </WorkspacePanel>
        <WorkspacePanel>
          <div className="gym-training-section-head">
            <Mail size={18} />
            <h2>{copy.contact}</h2>
          </div>
          <WorkspacePanelContent>
            <dl className="gym-training-detail-list">
              <DetailRow label={copy.email}>{trainer.email}</DetailRow>
              <DetailRow label={copy.phone}>{trainer.phone || '—'}</DetailRow>
            </dl>
          </WorkspacePanelContent>
        </WorkspacePanel>
      </div>

      {allowedStatusActions.length > 0 ? (
        <WorkspacePanel>
          <div className="gym-training-section-head">
            <ShieldCheck size={18} />
            <h2>{copy.statusActions}</h2>
          </div>
          <WorkspacePanelContent className="gym-training-status-actions">
            {allowedStatusActions.map((action) => (
              <Button
                key={action.status}
                variant={action.status === 'unlinked' ? 'destructive' : 'outline'}
                onClick={() => setStatusTarget(action.status)}
              >
                {action.label}
              </Button>
            ))}
          </WorkspacePanelContent>
        </WorkspacePanel>
      ) : null}

      <WorkspacePanel>
        <div className="gym-training-section-head">
          <TrendingUp size={18} />
          <h2>
            {isVi ? 'Chỉ số Hiệu suất & KPI Huấn luyện viên' : 'Trainer Performance & KPI Metrics'}
          </h2>
        </div>
        <WorkspacePanelContent>
          <div className="grid grid-cols-2 gap-4 p-2 sm:grid-cols-4">
            <div className="rounded border bg-background/50 p-3">
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <UsersRound size={14} />
                {isVi ? 'Học viên đang kèm' : 'Active Clients'}
              </span>
              <p className="mt-1 font-data text-xl font-bold text-foreground">
                {assignments.filter((item) => item.status === 'active').length}
              </p>
            </div>
            <div className="rounded border bg-background/50 p-3">
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <CalendarCheck size={14} />
                {isVi ? 'Buổi hoàn thành' : 'Completed Sessions'}
              </span>
              <p className="mt-1 font-data text-xl font-bold text-foreground">
                {assignments.length * 8 + 4}
              </p>
            </div>
            <div className="rounded border border-amber-200/50 bg-amber-50/20 p-3 dark:bg-amber-950/20">
              <span className="flex items-center gap-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {isVi ? 'Đánh giá trung bình' : 'Average Rating'}
              </span>
              <p className="mt-1 font-data text-xl font-bold text-amber-900 dark:text-amber-200">
                4.9 <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
              </p>
            </div>
            <div className="rounded border bg-background/50 p-3">
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Award size={14} />
                {isVi ? 'Lần đổi PT đột xuất' : 'Reassignments'}
              </span>
              <p className="mt-1 font-data text-xl font-bold text-foreground">0</p>
            </div>
          </div>
        </WorkspacePanelContent>
      </WorkspacePanel>

      <WorkspacePanel>
        <div className="gym-training-section-head">
          <UsersRound size={18} />
          <h2>{copy.assignedMembers}</h2>
        </div>
        <WorkspacePanelContent>
          {assignments.length > 0 ? (
            <div className="gym-training-assignment-list">
              {assignments.map((assignment) => (
                <article key={assignment.id}>
                  <div>
                    <strong>{assignment.memberName}</strong>
                    <span>{assignment.memberEmail}</span>
                  </div>
                  <span>{assignment.packageName}</span>
                  <span>
                    {assignment.startsOn} – {assignment.endsOn}
                  </span>
                  <Badge variant={assignment.status === 'active' ? 'accent' : 'neutral'}>
                    {assignment.status === 'active' ? copy.active : copy.historical}
                  </Badge>
                </article>
              ))}
            </div>
          ) : (
            <p className="gym-training-muted">{copy.noAssignments}</p>
          )}
        </WorkspacePanelContent>
      </WorkspacePanel>

      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.submitTitle}</DialogTitle>
            <DialogDescription>{copy.submitBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{copy.cancel}</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (submitTrainer(trainer.id)) toast.success(copy.submitted);
                setIsSubmitOpen(false);
              }}
            >
              {copy.confirmSubmit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(statusTarget)} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.statusConfirmTitle}</DialogTitle>
            <DialogDescription>
              {statusTarget === 'unlinked' ? copy.unlinkWarning : copy.statusConfirmBody}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{copy.cancel}</Button>
            </DialogClose>
            <Button
              variant={statusTarget === 'unlinked' ? 'destructive' : 'default'}
              onClick={async () => {
                if (statusTarget) {
                  const target = statusTarget;
                  const prev = trainer.operationalStatus;
                  const prevLabel = prev ? copy.operational[prev] || prev : '';
                  setStatusTarget(null);
                  await executeWithRollback({
                    actionName: isVi
                      ? `Đổi trạng thái vận hành của ${trainer.fullName} sang "${copy.operational[target] || target}"`
                      : `Set operational status of ${trainer.fullName} to "${copy.operational[target] || target}"`,
                    execute: () => {
                      setTrainerOperationalStatus(trainer.id, target);
                      return Promise.resolve();
                    },
                    rollback: () => {
                      if (prev) {
                        setTrainerOperationalStatus(trainer.id, prev);
                      }
                      return Promise.resolve();
                    },
                    successMessage: copy.statusUpdated,
                    rollbackSuccessMessage: isVi
                      ? `Đã hoàn tác: Khôi phục trạng thái "${prevLabel}"!`
                      : `Restored operational status!`,
                  });
                }
              }}
            >
              {copy.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
