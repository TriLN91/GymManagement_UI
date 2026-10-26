import {
  AlertTriangle,
  BadgeAlert,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  Shield,
  Sparkles,
  Ticket,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { passDistributionApi } from '../api/passDistributionApi';
import type {
  ActiveMemberAiPassResponse,
  AiPassSourceType,
  AiTierType,
  DistributionOfferDto,
} from '../types';

export function MemberAiPassPage() {
  const [passData, setPassData] = useState<ActiveMemberAiPassResponse | null>(null);
  const [pendingOffers, setPendingOffers] = useState<DistributionOfferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedOfferToAccept, setSelectedOfferToAccept] = useState<DistributionOfferDto | null>(
    null,
  );
  const [acknowledgeReplacement, setAcknowledgeReplacement] = useState(false);
  const [isSubmittingAccept, setIsSubmittingAccept] = useState(false);

  const [selectedOfferToDecline, setSelectedOfferToDecline] = useState<DistributionOfferDto | null>(
    null,
  );
  const [declineReason, setDeclineReason] = useState('');
  const [isSubmittingDecline, setIsSubmittingDecline] = useState(false);

  const [activeTab, setActiveTab] = useState<'current' | 'offers'>('current');

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [currentPassRes, offersRes] = await Promise.all([
        passDistributionApi.getCurrentPass().catch(() => ({
          hasActivePass: false,
          activePass: null,
          daysRemaining: 0,
        })),
        passDistributionApi.getMemberOffers().catch(() => []),
      ]);

      setPassData(currentPassRes);
      setPendingOffers(offersRes || []);
    } catch (err: unknown) {
      toast.error(
        'Không thể tải thông tin AI Pass: ' + (err instanceof Error ? err.message : 'Lỗi hệ thống'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleOpenAcceptModal = (offer: DistributionOfferDto) => {
    setSelectedOfferToAccept(offer);
    setAcknowledgeReplacement(false);
  };

  const handleConfirmAccept = async () => {
    if (!selectedOfferToAccept) return;

    const hasActive = passData?.hasActivePass && passData.activePass;
    if (hasActive && !acknowledgeReplacement) {
      toast.warning('Vui lòng tích xác nhận đồng ý thay thế thẻ hiện tại.');
      return;
    }

    setIsSubmittingAccept(true);
    try {
      const res = await passDistributionApi.acceptOffer(selectedOfferToAccept.id, {
        acknowledgeReplaceCurrentPass: Boolean(hasActive),
      });

      if (res.success) {
        toast.success(
          res.message || 'Kích hoạt thẻ AI Pass thành công! Quyền lợi đã sẵn sàng sử dụng.',
        );
        setSelectedOfferToAccept(null);
        await fetchData(true);
        setActiveTab('current');
      } else {
        toast.warning(res.message);
      }
    } catch (err: unknown) {
      toast.error(
        'Kích hoạt thẻ thất bại: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'),
      );
    } finally {
      setIsSubmittingAccept(false);
    }
  };

  const handleConfirmDecline = async () => {
    if (!selectedOfferToDecline) return;

    setIsSubmittingDecline(true);
    try {
      await passDistributionApi.declineOffer(selectedOfferToDecline.id, {
        reason: declineReason.trim() || undefined,
      });
      toast.info('Đã từ chối ưu đãi. Suất thẻ đã được hoàn về cho phòng gym.');
      setSelectedOfferToDecline(null);
      setDeclineReason('');
      await fetchData(true);
    } catch (err: unknown) {
      toast.error(
        'Không thể từ chối ưu đãi: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'),
      );
    } finally {
      setIsSubmittingDecline(false);
    }
  };

  const getOfferDaysLeft = (expiresAtUtc: string) => {
    const end = new Date(expiresAtUtc).getTime();
    const diff = end - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (diff <= 0) return 'Đã hết hạn';
    if (days > 0) return `Còn ${days} ngày ${hours}h`;
    return `Còn ${hours} giờ`;
  };

  const getTierColor = (tier?: AiTierType) => {
    switch (tier) {
      case 'Enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'CoachAi':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
      case 'Plus':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    }
  };

  const getSourceBadge = (source: AiPassSourceType) => {
    switch (source) {
      case 'GymDistributed':
        return 'Được tài trợ bởi Phòng Gym';
      case 'PlatformGrant':
        return 'FitFlex Quà Tặng Nền Tảng';
      default:
        return 'Gói mua cá nhân';
    }
  };

  const parseFeatures = (featuresJson?: string): string[] => {
    if (!featuresJson) return [];
    try {
      const parsed: unknown = JSON.parse(featuresJson);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item));
      return [String(parsed)];
    } catch {
      return featuresJson
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  const activePass = passData?.activePass;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Đang tải thông tin AI Pass...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Thẻ AI Pass Của Tôi
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> FitFlex AI
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý quyền lợi trí tuệ nhân tạo, camera chấm form và các suất ưu đãi từ phòng gym đối
            tác.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3.5 py-2 text-sm font-medium shadow-sm transition hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'current'
              ? 'border-primary font-semibold text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Ticket className="h-4 w-4" />
          Thẻ hiện tại {activePass && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'offers'
              ? 'border-primary font-semibold text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Ưu đãi nhận thẻ
          {pendingOffers.length > 0 && (
            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">
              {pendingOffers.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CURRENT ACTIVE PASS */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {activePass ? (
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-md md:p-8">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {activePass.snapshot?.aiTier && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getTierColor(
                          activePass.snapshot.aiTier,
                        )}`}
                      >
                        <Sparkles className="h-3 w-3" />
                        Hạng {activePass.snapshot.aiTier}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" /> Đang hoạt động
                    </span>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                      {getSourceBadge(activePass.sourceType)}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                      {activePass.passName}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Kích hoạt lúc: {new Date(activePass.activatedAtUtc).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {activePass.snapshot?.issuerName && (
                    <div className="flex items-center gap-2 rounded-lg bg-accent/50 p-3 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      <div>
                        Đơn vị cấp:{' '}
                        <span className="font-semibold text-foreground">
                          {activePass.snapshot.issuerName}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Validity Info */}
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/80 bg-background/60 p-4 sm:grid-cols-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Hiệu lực từ</span>
                      <p className="font-medium text-foreground">
                        {new Date(activePass.startsAtUtc).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Hết hạn vào</span>
                      <p className="font-medium text-foreground">
                        {new Date(activePass.expiresAtUtc).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-xs text-muted-foreground">Thời gian còn lại</span>
                      <p className="text-lg font-bold text-primary">
                        {passData?.daysRemaining ?? 0} ngày
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side: Snapshot Entitlements */}
                {activePass.snapshot && (
                  <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 font-semibold text-foreground">
                      <Shield className="h-4 w-4 text-primary" /> Quyền lợi bảo lưu (Snapshot)
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Được đóng băng tại thời điểm cấp thẻ, không bị thay đổi theo biến động giá hệ
                      thống.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-accent/40 p-2.5 text-sm">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Bot className="h-4 w-4 text-primary" /> Lượt đánh giá AI cho phép:
                        </span>
                        <span className="font-bold text-foreground">
                          {activePass.snapshot.allowedAssessmentsCount} lượt/kỳ
                        </span>
                      </div>

                      {parseFeatures(activePass.snapshot.featuresJson).length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Tính năng mở khóa:
                          </span>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {parseFeatures(activePass.snapshot.featuresJson).map((feat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                              >
                                <Sparkles className="h-3 w-3" /> {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <Ticket className="h-10 w-10" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-foreground">
                Chưa có Thẻ AI Pass Hoạt Động
              </h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Bạn chưa kích hoạt thẻ AI Pass nào. Hãy nhận thẻ từ phòng gym bạn đang tham gia hoặc
                kiểm tra tab &quot;Ưu đãi nhận thẻ&quot; nếu quản lý phòng gym vừa gửi ưu đãi cho
                bạn.
              </p>
              {pendingOffers.length > 0 && (
                <button
                  onClick={() => setActiveTab('offers')}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  <Sparkles className="h-4 w-4" /> Xem {pendingOffers.length} Ưu Đãi Đang Chờ
                </button>
              )}
            </div>
          )}

          {/* Quick Notice about Single Active Pass Policy */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
            <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-semibold">
                Chính sách Thẻ AI Đơn Lẻ (FitFlex Single Active Pass Policy)
              </p>
              <p className="mt-1 text-xs leading-relaxed text-blue-800/90 dark:text-blue-300/90">
                Để đảm bảo tính nhất quán của mô hình huấn luyện AI cá nhân hóa, mỗi hội viên chỉ
                kích hoạt 01 thẻ tại một thời điểm. Nếu bạn nhận một thẻ AI Pass mới trong khi thẻ
                cũ còn hạn, thời gian và quyền lợi thẻ cũ sẽ tự động được thay thế hoàn toàn (không
                cộng dồn).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING OFFERS */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          {pendingOffers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-bold text-foreground">
                Không Có Ưu Đãi Nào Đang Chờ
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Khi phòng gym liên kết cấp thẻ AI Pass cho bạn, lời mời sẽ xuất hiện tại đây với
                thời hạn nhận thẻ là 14 ngày.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {pendingOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <Sparkles className="h-3 w-3" /> Gói AI Pass
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <Clock className="h-3 w-3" /> {getOfferDaysLeft(offer.expiresAtUtc)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-foreground">{offer.passTypeName}</h3>
                      {offer.programName && (
                        <p className="text-xs text-muted-foreground">
                          Chương trình: {offer.programName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 rounded-lg bg-accent/40 p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Shield className="h-3.5 w-3.5 text-primary" /> {offer.gymName}
                      </div>
                      {offer.branchName && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> Chi nhánh: {offer.branchName}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> Ngày gửi:{' '}
                        <span className="font-medium text-foreground">
                          {new Date(offer.offerSentAtUtc).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {offer.message && (
                      <p className="rounded-lg border border-border/60 bg-background/50 p-2.5 text-xs italic text-muted-foreground">
                        &ldquo;{offer.message}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-border pt-4">
                    <button
                      onClick={() => handleOpenAcceptModal(offer)}
                      className="flex-1 rounded-lg bg-primary py-2 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    >
                      Kích hoạt nhận thẻ
                    </button>
                    <button
                      onClick={() => setSelectedOfferToDecline(offer)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ACCEPT OFFER (WITH REPLACEMENT WARNING IF ACTIVE PASS EXISTS) */}
      {selectedOfferToAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-2.5 ${
                  activePass
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {activePass ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {activePass ? 'Xác Nhận Thay Thế Thẻ AI Pass' : 'Kích Hoạt Thẻ AI Pass'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Gói thẻ: {selectedOfferToAccept.passTypeName}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2 rounded-xl bg-accent/40 p-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đơn vị tài trợ:</span>
                  <span className="font-semibold text-foreground">
                    {selectedOfferToAccept.gymName}
                  </span>
                </div>
                {selectedOfferToAccept.branchName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chi nhánh:</span>
                    <span className="font-semibold text-foreground">
                      {selectedOfferToAccept.branchName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời hạn nhận thẻ:</span>
                  <span className="font-semibold text-foreground">
                    Hết hạn ngày{' '}
                    {new Date(selectedOfferToAccept.expiresAtUtc).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* CRITICAL REPLACEMENT WARNING */}
              {activePass ? (
                <div className="space-y-3 rounded-xl border border-amber-300/80 bg-amber-50/90 p-4 dark:border-amber-900/60 dark:bg-amber-950/40">
                  <div className="flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <BadgeAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="leading-relaxed">
                      <p className="font-bold">Cảnh báo hủy quyền lợi thẻ cũ:</p>
                      <p className="mt-1">
                        Bạn đang có thẻ <span className="font-semibold">{activePass.passName}</span>{' '}
                        còn hiệu lực đến{' '}
                        <span className="font-semibold">
                          {new Date(activePass.expiresAtUtc).toLocaleDateString('vi-VN')}
                        </span>{' '}
                        ({passData?.daysRemaining ?? 0} ngày còn lại).
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                        Theo chính sách FitFlex, mỗi hội viên chỉ có 01 thẻ kích hoạt. Kích hoạt thẻ
                        mới sẽ <span className="font-bold underline">hủy ngay lập tức</span> thời
                        gian và số lượt đánh giá còn lại của thẻ cũ (Không cộng dồn ngày, không hoàn
                        tiền).
                      </p>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-2 border-t border-amber-200/60 pt-2 dark:border-amber-900/40">
                    <input
                      type="checkbox"
                      checked={acknowledgeReplacement}
                      onChange={(e) => setAcknowledgeReplacement(e.target.checked)}
                      className="mt-0.5 rounded border-amber-400 text-primary focus:ring-primary"
                    />
                    <span className="select-none text-xs font-semibold text-amber-950 dark:text-amber-100">
                      Tôi hiểu và đồng ý hủy quyền lợi thẻ hiện tại để kích hoạt thẻ mới.
                    </span>
                  </label>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sau khi kích hoạt, thẻ sẽ có hiệu lực ngay lập tức theo đúng quyền lợi đóng băng.
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOfferToAccept(null)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={isSubmittingAccept || (Boolean(activePass) && !acknowledgeReplacement)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmittingAccept && <Loader2 className="h-4 w-4 animate-spin" />}
                {activePass ? 'Xác Nhận & Thay Thế Thẻ' : 'Kích Hoạt Ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DECLINE OFFER */}
      {selectedOfferToDecline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-rose-100 p-2.5 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Từ Chối Ưu Đãi AI Pass?</h3>
                <p className="text-xs text-muted-foreground">
                  Phòng gym: {selectedOfferToDecline.gymName}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Bạn có chắc chắn muốn từ chối gói thẻ{' '}
              <span className="font-semibold text-foreground">
                {selectedOfferToDecline.passTypeName}
              </span>
              ? Suất thẻ giữ chỗ sẽ được hoàn trả lại kho của phòng gym và lời mời này sẽ bị đóng
              lại.
            </p>

            <div className="mt-4">
              <label className="text-xs font-medium text-foreground">
                Lý do từ chối (tùy chọn):
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={2}
                className="mt-1 w-full rounded-lg border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOfferToDecline(null)}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                Giữ lại
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={isSubmittingDecline}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmittingDecline && <Loader2 className="h-4 w-4 animate-spin" />}
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
