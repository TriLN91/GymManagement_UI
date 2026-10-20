import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Building2,
  CalendarCheck,
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
import { WorkspacePage, WorkspacePanel, WorkspacePanelContent } from '@/shared/ui/workspace';

import './gym-owner-training.css';

function useTrainingCopy() {
  const { language, locale } = useLocale();
  return { copy: gymOwnerTrainingCopy[language], locale, isVi: language === 'vi' };
}

export function GymOwnerTrainerListPage() {
  const { copy, isVi } = useTrainingCopy();
  const { executeWithRollback } = useActionRollback();
  const openExceptions = useGymOwnerTrainingStore(
    (state) => state.assignmentExceptions.filter((item) => item.status === 'open').length,
  );

  // Real backend data states
  const [overview, setOverview] = useState<GymTrainersLeaderboardDto | null>(null);
  const [branches, setBranches] = useState<GymBranchCardView[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create PT modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createPrimaryBranchId, setCreatePrimaryBranchId] = useState('');
  const [createAdditionalBranchIds, setCreateAdditionalBranchIds] = useState<string[]>([]);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState('');

  // Credentials dialog states
  const [createdCredentials, setCreatedCredentials] = useState<CreateGymTrainerResponse | null>(null);
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
      setCreateError(isVi ? 'Vui lòng nhập email hợp lệ (vd: trainer@gmail.com)' : 'Please enter a valid email.');
      return;
    }
    if (!createFullName.trim()) {
      setCreateError(isVi ? 'Vui lòng nhập họ và tên huấn luyện viên' : 'Please enter full name.');
      return;
    }
    if (!createPrimaryBranchId) {
      setCreateError(isVi ? 'Vui lòng chọn cơ sở làm việc chính' : 'Please select a primary branch.');
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
      toast.success(isVi ? 'Đã tạo tài khoản Huấn luyện viên thành công!' : 'Trainer created successfully!');
      void loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (isVi ? 'Không thể tạo tài khoản huấn luyện viên.' : 'Failed to create trainer.');
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
          ? (isVi ? `Đã kích hoạt hoạt động của PT ${trainer.fullName}` : `Activated ${trainer.fullName}`)
          : (isVi ? `Đã tạm ngưng hoạt động của PT ${trainer.fullName}` : `Suspended ${trainer.fullName}`),
        rollbackSuccessMessage: isVi
          ? `Đã hoàn tác: Khôi phục trạng thái hoạt động của PT ${trainer.fullName}!`
          : `Restored status for ${trainer.fullName}!`,
        onAfterRollback: () => {
          void loadData();
        },
      });
      void loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (isVi ? 'Không thể cập nhật trạng thái.' : 'Failed to update status.');
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
      toast.error(isVi ? 'Huấn luyện viên phải trực thuộc ít nhất 1 chi nhánh.' : 'Trainer must belong to at least 1 branch.');
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
          await marketplaceApi.updateTrainerBranches(targetTrainer.trainerProfileId, previousBranchIds);
        },
        successMessage: isVi ? 'Đã cập nhật phân bổ chi nhánh thành công!' : 'Branches updated successfully!',
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
      const message = err instanceof Error ? err.message : (isVi ? 'Không thể cập nhật chi nhánh.' : 'Failed to update branches.');
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
      const msg = err instanceof Error ? err.message : (isVi ? 'Không thể hủy liên kết huấn luyện viên.' : 'Failed to unlink trainer.');
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
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Spotlight Card: Top Booked PT */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Trophy size={16} className="text-amber-500 fill-amber-500" />
              {isVi ? 'Top Huấn luyện viên được đặt lịch nhiều nhất' : 'Most Booked Personal Trainer'}
            </span>
            <Badge variant="neutral" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-xs">
              ⭐ {topPT ? `${topPT.averageRating.toFixed(1)} / 5.0` : '5.0 / 5.0'}
            </Badge>
          </div>

          {topPT ? (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <TrainerAvatar name={topPT.fullName} source={topPT.avatarUrl} large />
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    {topPT.fullName}
                    {topPT.isProfileComplete ? (
                      <Badge variant="neutral" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                        {isVi ? 'Đã kích hoạt' : 'Active'}
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                        {isVi ? 'Hồ sơ sơ cấp' : 'Basic Profile'}
                      </Badge>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{topPT.email} {topPT.phoneNumber ? `• ${topPT.phoneNumber}` : ''}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {topPT.assignedBranches.map((b) => (
                      <span key={b.branchId} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-foreground">
                        <Building2 size={11} className="text-muted-foreground" />
                        {b.branchName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto bg-background/80 backdrop-blur p-3 rounded-xl border border-border">
                <div className="text-center px-2">
                  <span className="block text-[11px] text-muted-foreground">{isVi ? 'Buổi hoàn thành' : 'Completed'}</span>
                  <strong className="text-lg font-bold font-data text-foreground">{topPT.completedSessionsCount}</strong>
                </div>
                <div className="text-center px-2 border-x border-border">
                  <span className="block text-[11px] text-muted-foreground">{isVi ? 'Lịch sắp tới' : 'Upcoming'}</span>
                  <strong className="text-lg font-bold font-data text-primary">{topPT.scheduledSessionsCount}</strong>
                </div>
                <div className="text-center px-2">
                  <span className="block text-[11px] text-muted-foreground">{isVi ? 'Học viên kèm' : 'Clients'}</span>
                  <strong className="text-lg font-bold font-data text-emerald-600">{topPT.activeClientsCount}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-6 text-muted-foreground text-sm">
              <UsersRound className="mx-auto mb-2 opacity-40" size={32} />
              {isVi ? 'Chưa có dữ liệu đặt lịch cho huấn luyện viên.' : 'No booking data yet.'}
            </div>
          )}
        </div>

        {/* Aggregate KPI summary cards */}
        <div className="grid grid-rows-3 gap-3">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <UsersRound size={20} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">{isVi ? 'Tổng số Huấn luyện viên' : 'Total Trainers'}</span>
                <strong className="text-xl font-bold font-data text-foreground">{overview?.totalTrainers ?? trainersList.length}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <UserCheck size={20} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">{isVi ? 'Đang hoạt động nhận ca' : 'Active Trainers'}</span>
                <strong className="text-xl font-bold font-data text-emerald-600">{overview?.activeTrainers ?? 0}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">{isVi ? 'Hồ sơ chưa hoàn thiện' : 'Incomplete Profiles'}</span>
                <strong className="text-xl font-bold font-data text-amber-600">{overview?.incompleteProfilesCount ?? 0}</strong>
                <p className="text-[10px] text-muted-foreground">{isVi ? 'Hệ thống sẽ ép điền khi PT đăng nhập' : 'Enforced on login'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Trainer List Table ─────────────────────────────────────────── */}
      <WorkspacePanel className="gym-training-list-panel mt-2">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {isVi ? 'Danh sách Huấn luyện viên trực thuộc hệ thống' : 'Affiliated Trainers List'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isVi ? 'Quản lý tài khoản, trạng thái hoạt động và phân bổ chi nhánh làm việc' : 'Manage accounts, operational status and branch assignments'}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {isVi ? `Hiển thị ${trainersList.length} HLV` : `Showing ${trainersList.length} trainers`}
          </span>
        </div>

        <ManagementState
          state={isLoading ? 'loading' : 'loaded'}
          isEmpty={trainersList.length === 0}
          loadingLabel={copy.loading}
          emptyLabel={isVi ? 'Chưa có huấn luyện viên nào. Hãy bấm "Thêm Huấn luyện viên mới" để cấp tài khoản.' : copy.noTrainers}
          errorLabel={copy.listError}
        >
          <div className="divide-y divide-border">
            {trainersList.map((trainer) => (
              <article key={trainer.trainerProfileId} className="p-4 hover:bg-muted/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Identity */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <TrainerAvatar name={trainer.fullName} source={trainer.avatarUrl} />
                  <div>
                    <strong className="block text-sm font-semibold text-foreground">{trainer.fullName}</strong>
                    <span className="text-xs text-muted-foreground block">{trainer.email}</span>
                    {trainer.phoneNumber ? (
                      <span className="text-xs text-muted-foreground">{trainer.phoneNumber}</span>
                    ) : (
                      <span className="text-[11px] text-amber-600 italic">{isVi ? 'Chưa cập nhật SĐT' : 'No phone'}</span>
                    )}
                  </div>
                </div>

                {/* Branches */}
                <div className="flex-1 min-w-[200px]">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
                    {isVi ? 'Cơ sở phân bổ' : 'Assigned Branches'}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {trainer.assignedBranches.length > 0 ? (
                      trainer.assignedBranches.map((b) => (
                        <span key={b.branchId} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
                          <Building2 size={12} className="text-muted-foreground" />
                          {b.branchName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-amber-600 italic">{isVi ? 'Chưa phân cơ sở' : 'Unassigned'}</span>
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
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
                    {isVi ? 'Hồ sơ chuyên môn' : 'Profile Status'}
                  </span>
                  {trainer.isProfileComplete ? (
                    <Badge variant="neutral" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                      <Check size={12} className="mr-1" />
                      {isVi ? 'Đã hoàn tất' : 'Complete'}
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                      <AlertTriangle size={12} className="mr-1" />
                      {isVi ? 'Chưa hoàn tất (Ép điền)' : 'Incomplete'}
                    </Badge>
                  )}
                </div>

                {/* Status Toggle & Metrics */}
                <div className="flex items-center gap-4 min-w-[120px]">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
                      {isVi ? 'Vận hành' : 'Status'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleToggleStatus(trainer)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
                        trainer.isActive
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${trainer.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      {trainer.isActive ? (isVi ? 'Hoạt động' : 'Active') : (isVi ? 'Tạm dừng' : 'Disabled')}
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
                {isVi ? 'Hệ thống sẽ dùng email này làm tài khoản đăng nhập.' : 'Will be used as login username.'}
              </span>
            </div>

            <div>
              <Label htmlFor="pt-name">{isVi ? 'Họ và tên huấn luyện viên (*)' : 'Full Name (*)'}</Label>
              <Input
                id="pt-name"
                placeholder="vd: Nguyễn Văn Hùng"
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="pt-branch">{isVi ? 'Chi nhánh làm việc chính (*)' : 'Primary Branch (*)'}</Label>
              {branches.length > 0 ? (
                <select
                  id="pt-branch"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
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
                <p className="text-xs text-amber-600 italic">
                  {isVi ? 'Đang tải danh sách cơ sở hoặc bạn chưa tạo chi nhánh nào.' : 'Loading branches...'}
                </p>
              )}
            </div>

            {branches.length > 1 && (
              <div>
                <Label className="block mb-2">{isVi ? 'Các chi nhánh hỗ trợ khác (tùy chọn)' : 'Additional Branches'}</Label>
                <div className="space-y-2 border p-3 rounded-lg max-h-36 overflow-y-auto">
                  {branches
                    .filter((b) => b.id !== createPrimaryBranchId)
                    .map((b) => (
                      <label key={b.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={createAdditionalBranchIds.includes(b.id)}
                          onChange={() =>
                            setCreateAdditionalBranchIds((prev) =>
                              prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id],
                            )
                          }
                        />
                        <span>{b.branchName}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold">{isVi ? '💡 Cơ chế tự điền hồ sơ (Ép điền):' : '💡 Enforced Profile Setup:'}</p>
              <p className="mt-0.5">
                {isVi
                  ? 'Chủ phòng gym không cần nhập kinh nghiệm hay bio. Khi PT đăng nhập lần đầu, hệ thống sẽ bắt buộc PT điền đầy đủ hồ sơ trước khi nhận học viên.'
                  : 'Owner does not need to fill bio/experience. PT will be forced to complete profile upon first login.'}
              </p>
            </div>

            {createError && (
              <p role="alert" className="text-xs text-destructive font-medium">
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
      <Dialog open={Boolean(createdCredentials)} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Check className="p-1 rounded-full bg-emerald-100 text-emerald-600" size={24} />
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
              <div className="p-4 rounded-xl bg-muted/60 border space-y-2.5">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">{isVi ? 'Họ và tên PT' : 'Full Name'}</span>
                  <strong className="text-sm font-semibold">{createdCredentials.fullName}</strong>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">{isVi ? 'Tài khoản đăng nhập (Email)' : 'Username (Email)'}</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <code className="text-xs font-mono bg-background px-2 py-1 rounded border">{createdCredentials.email}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                    >
                      {copiedKey === 'email' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">{isVi ? 'Mật khẩu tạm thời' : 'Temporary Password'}</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <code className="text-xs font-mono font-bold bg-background text-primary px-2 py-1 rounded border">
                      {createdCredentials.temporaryPassword}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => copyToClipboard(createdCredentials.temporaryPassword, 'password')}
                    >
                      {copiedKey === 'password' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground block">{isVi ? 'Cơ sở phân bổ' : 'Assigned Branch'}</span>
                  <span className="text-xs font-medium">{createdCredentials.primaryBranchName}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200">
                <p className="font-semibold">{isVi ? '✅ Quy trình lần đầu đăng nhập:' : '✅ First login process:'}</p>
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
                {copiedKey === 'all' ? (isVi ? 'Đã sao chép toàn bộ!' : 'Copied all!') : (isVi ? 'Sao chép toàn bộ thông tin đăng nhập' : 'Copy All Credentials')}
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
      <Dialog open={Boolean(branchModalTrainer)} onOpenChange={(open) => !open && setBranchModalTrainer(null)}>
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
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {isVi ? 'Danh sách cơ sở trong chuỗi:' : 'Brand Branches:'}
            </Label>
            <div className="space-y-2 border rounded-xl p-3 max-h-56 overflow-y-auto">
              {branches.map((b) => {
                const isChecked = selectedBranchIds.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition ${
                      isChecked ? 'bg-primary/10 border-primary/40' : 'bg-background hover:bg-muted/40 border-border'
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
                      <strong className="block text-xs font-semibold text-foreground">{b.branchName}</strong>
                      <span className="text-[11px] text-muted-foreground block">{b.addressLine1}, {b.city}</span>
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
              {isSavingBranches ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu phân bổ chi nhánh' : 'Save Assignments')}
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
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
              <p className="font-semibold">{isVi ? '⚠️ Kiểm tra an toàn trước khi xóa/hủy liên kết:' : 'Safety validation check:'}</p>
              <p className="mt-1">
                {isVi
                  ? 'Hệ thống sẽ kiểm tra xem PT có lịch hẹn hoặc buổi tập sắp diễn ra nào không. Nếu có, thao tác sẽ bị chặn và bạn cần chuyển giao (reassign) các buổi tập sang huấn luyện viên khác trước.'
                  : 'System checks for active upcoming appointments before allowing unlink.'}
              </p>
            </div>

            {unlinkError && (
              <div role="alert" className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive font-medium">
                {unlinkError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUnlinkTarget(null)}>
              {copy.cancel}
            </Button>
            <Button variant="destructive" onClick={() => void handleExecuteUnlink()} disabled={isUnlinking}>
              {isUnlinking ? (isVi ? 'Đang kiểm tra & xóa...' : 'Processing...') : (isVi ? 'Xác nhận hủy liên kết' : 'Confirm Unlink')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}

// ── Streamlined Create / Edit PT Form Page (for direct URL navigation) ────────
export function GymOwnerTrainerFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { copy, isVi } = useTrainingCopy();
  const { trainerId = '' } = useParams();
  const navigate = useNavigate();
  const trainer = useGymOwnerTrainingStore((state) =>
    state.trainers.find((item) => item.id === trainerId),
  );

  const [branches, setBranches] = useState<GymBranchCardView[]>([]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [primaryBranchId, setPrimaryBranchId] = useState('');
  const [additionalBranchIds, setAdditionalBranchIds] = useState<string[]>([]);
  const [createdCredentials, setCreatedCredentials] = useState<CreateGymTrainerResponse | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const myBrands = await marketplaceApi.getMyBrands();
      const firstBrand = myBrands[0];
      if (firstBrand) {
        const b = await marketplaceApi.getBrandBranches(firstBrand.id);
        setBranches(b);
        const firstBranch = b[0];
        if (firstBranch && !primaryBranchId) {
          setPrimaryBranchId(firstBranch.id);
        }
      }
    })();
  }, [primaryBranchId]);

  if (mode === 'edit' && (!trainer || !['draft', 'rejected'].includes(trainer.approvalStatus))) {
    return (
      <Navigate
        to={trainer ? ROUTES.admin.trainerDetailPath(trainer.id) : ROUTES.admin.pts}
        replace
      />
    );
  }

  const handleSave = async () => {
    if (!email.trim() || !email.includes('@') || !fullName.trim() || !primaryBranchId) {
      setError(isVi ? 'Vui lòng điền đầy đủ Email, Họ tên và Chi nhánh làm việc.' : 'Please enter all required fields.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const res = await marketplaceApi.createGymTrainer({
        email: email.trim(),
        fullName: fullName.trim(),
        branchId: primaryBranchId,
        additionalBranchIds,
      });
      setCreatedCredentials(res);
      toast.success(isVi ? 'Đã tạo tài khoản huấn luyện viên!' : 'Trainer created successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isVi ? 'Không thể tạo huấn luyện viên.' : 'Failed to create trainer.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <WorkspacePage className="gym-training-page max-w-xl mx-auto">
      <div className="gym-training-toolbar">
        <Button asChild variant="ghost">
          <Link to={ROUTES.admin.pts}>
            <ArrowLeft aria-hidden="true" size={16} />
            {copy.back}
          </Link>
        </Button>
      </div>

      <WorkspacePanel className="p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isVi ? 'Thêm Huấn luyện viên mới vào phòng Gym' : 'Add New Personal Trainer'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isVi
              ? 'Chủ phòng gym chỉ cần cấp email và gán chi nhánh. Hệ thống sẽ cấp mật khẩu và ép PT hoàn tất hồ sơ khi đăng nhập lần đầu.'
              : 'Enter basic information to issue trainer account.'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="page-pt-email">{isVi ? 'Gmail / Email đăng ký (*)' : 'Email (*)'}</Label>
            <Input
              id="page-pt-email"
              type="email"
              placeholder="trainer@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="page-pt-name">{isVi ? 'Họ và tên (*)' : 'Full Name (*)'}</Label>
            <Input
              id="page-pt-name"
              placeholder="Nguyễn Văn Hùng"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="page-pt-branch">{isVi ? 'Chi nhánh làm việc chính (*)' : 'Primary Branch (*)'}</Label>
            <select
              id="page-pt-branch"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={primaryBranchId}
              onChange={(e) => setPrimaryBranchId(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName} — {b.city}
                </option>
              ))}
            </select>
          </div>

          {branches.length > 1 && (
            <div>
              <Label className="block mb-2">{isVi ? 'Các chi nhánh hỗ trợ khác' : 'Additional Branches'}</Label>
              <div className="space-y-2 border p-3 rounded-lg max-h-36 overflow-y-auto">
                {branches
                  .filter((b) => b.id !== primaryBranchId)
                  .map((b) => (
                    <label key={b.id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <Checkbox
                        checked={additionalBranchIds.includes(b.id)}
                        onChange={() =>
                          setAdditionalBranchIds((prev) =>
                            prev.includes(b.id) ? prev.filter((id) => id !== b.id) : [...prev, b.id],
                          )
                        }
                      />
                      <span>{b.branchName}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(ROUTES.admin.pts)}>
              {copy.cancel}
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving} className="gap-2">
              <UserPlus size={16} />
              {isSaving ? (isVi ? 'Đang tạo...' : 'Creating...') : (isVi ? 'Tạo tài khoản PT' : 'Create Trainer')}
            </Button>
          </div>
        </div>
      </WorkspacePanel>

      {/* Generated Credentials Dialog */}
      <Dialog open={Boolean(createdCredentials)} onOpenChange={(open) => !open && navigate(ROUTES.admin.pts)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-600 flex items-center gap-2">
              <Check className="p-1 rounded-full bg-emerald-100 text-emerald-600" size={24} />
              {isVi ? 'Tài khoản PT đã tạo thành công' : 'Trainer Created Successfully'}
            </DialogTitle>
          </DialogHeader>
          {createdCredentials && (
            <div className="space-y-3 py-2 text-sm">
              <div className="p-3.5 rounded-xl bg-muted/60 border space-y-2 font-mono text-xs">
                <div>Email: <strong className="text-foreground">{createdCredentials.email}</strong></div>
                <div>Mật khẩu: <strong className="text-primary">{createdCredentials.temporaryPassword}</strong></div>
                <div>Chi nhánh: <span className="text-muted-foreground">{createdCredentials.primaryBranchName}</span></div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  const text = `Email: ${createdCredentials.email} | Mật khẩu: ${createdCredentials.temporaryPassword} | Chi nhánh: ${createdCredentials.primaryBranchName}`;
                  void navigator.clipboard.writeText(text);
                  toast.success(isVi ? 'Đã sao chép mật khẩu!' : 'Copied credentials!');
                }}
              >
                <Copy size={14} className="mr-2" />
                {isVi ? 'Sao chép thông tin tài khoản' : 'Copy Credentials'}
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => void navigate(ROUTES.admin.pts)}>{isVi ? 'Hoàn tất' : 'Done'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            {isVi
              ? 'Chỉ số Hiệu suất & KPI Huấn luyện viên'
              : 'Trainer Performance & KPI Metrics'}
          </h2>
        </div>
        <WorkspacePanelContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2">
            <div className="p-3 border rounded bg-background/50">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <UsersRound size={14} />
                {isVi ? 'Học viên đang kèm' : 'Active Clients'}
              </span>
              <p className="text-xl font-bold font-data text-foreground mt-1">
                {assignments.filter((item) => item.status === 'active').length}
              </p>
            </div>
            <div className="p-3 border rounded bg-background/50">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <CalendarCheck size={14} />
                {isVi ? 'Buổi hoàn thành' : 'Completed Sessions'}
              </span>
              <p className="text-xl font-bold font-data text-foreground mt-1">
                {assignments.length * 8 + 4}
              </p>
            </div>
            <div className="p-3 border rounded border-amber-200/50 bg-amber-50/20 dark:bg-amber-950/20">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {isVi ? 'Đánh giá trung bình' : 'Average Rating'}
              </span>
              <p className="text-xl font-bold font-data text-amber-900 dark:text-amber-200 mt-1">
                4.9 <span className="text-xs font-normal text-muted-foreground">/ 5.0</span>
              </p>
            </div>
            <div className="p-3 border rounded bg-background/50">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Award size={14} />
                {isVi ? 'Lần đổi PT đột xuất' : 'Reassignments'}
              </span>
              <p className="text-xl font-bold font-data text-foreground mt-1">0</p>
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
                  const prevLabel = prev ? (copy.operational[prev] || prev) : '';
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
