import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { passDistributionApi } from '../api/passDistributionApi';
import { useDistributionGym } from '../model/useDistributionGym';
import type { DistributionOfferDto, DistributionProgramDto, PassTypeDto } from '../types';

export function GymPassOffersPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const { context, gyms, gymId, setSelected } = useDistributionGym();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [offers, setOffers] = useState<DistributionOfferDto[]>([]);
  const [recipients, setRecipients] = useState<
    { memberProfileId: string; fullName: string; email: string }[]
  >([]);
  const [programs, setPrograms] = useState<DistributionProgramDto[]>([]);
  const [passTypes, setPassTypes] = useState<PassTypeDto[]>([]);

  // Search & Filter
  const [searchMember, setSearchMember] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Send Offer Modal State
  const [showSendModal, setShowSendModal] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState('');
  const [selectedPassTypeId, setSelectedPassTypeId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [sendingOffer, setSendingOffer] = useState(false);

  const loadData = useCallback(async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      setError(null);
      const [offerData, progData, typesData, recipientData] = await Promise.all([
        passDistributionApi.getGymOffers(gymId),
        passDistributionApi.getGymPrograms(gymId),
        passDistributionApi.getPassTypes(true),
        passDistributionApi.getRecipients(gymId),
      ]);
      setOffers(offerData);
      setRecipients(recipientData);
      setPrograms(progData);
      setPassTypes(typesData);
      const firstType = typesData[0];
      if (firstType) setSelectedPassTypeId(firstType.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách lời mời');
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !targetMemberId.trim() || !selectedPassTypeId) return;
    try {
      setSendingOffer(true);
      await passDistributionApi.sendOffer(gymId, {
        memberProfileId: targetMemberId.trim(),
        passTypeId: selectedPassTypeId,
        distributionProgramId: selectedProgramId || undefined,
        message: offerMessage.trim() || undefined,
      });

      setShowSendModal(false);
      setTargetMemberId('');
      setOfferMessage('');
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gửi lời mời thất bại');
    } finally {
      setSendingOffer(false);
    }
  };

  const handleCancelOffer = async (offerId: string) => {
    if (
      !confirm(
        isVi
          ? 'Bạn có chắc chắn muốn hủy lời mời này? Credit sẽ được giải phóng về kho khả dụng.'
          : 'Are you sure you want to cancel this offer? The credit will return to available inventory.',
      )
    )
      return;
    try {
      await passDistributionApi.cancelOffer(gymId, offerId);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Hủy lời mời thất bại');
    }
  };

  const filteredOffers = offers.filter((o) => {
    const matchSearch =
      o.memberFullName.toLowerCase().includes(searchMember.toLowerCase()) ||
      o.memberEmail.toLowerCase().includes(searchMember.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            <Clock className="h-3 w-3" />
            {isVi ? 'Đang chờ (14 ngày)' : 'Pending (14d)'}
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            {isVi ? 'Đã kích hoạt' : 'Accepted'}
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/20 px-2.5 py-0.5 text-xs font-medium text-rose-400">
            <XCircle className="h-3 w-3" />
            {isVi ? 'Đã từ chối' : 'Declined'}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-300">
            {isVi ? 'Đã hủy' : 'Cancelled'}
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
            {isVi ? 'Quá hạn' : 'Expired'}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  if (!gymId) {
    if (context.isPending) return <p role="status">Loading your Gym organizations…</p>;
    if (context.isError)
      return (
        <div role="alert">
          Could not load your Gym organizations.{' '}
          <button onClick={() => void context.refetch()}>Retry</button>
        </div>
      );
    if (gyms.length > 1)
      return (
        <label>
          Select Gym
          <select value="" onChange={(e) => setSelected(e.target.value)}>
            <option value="">Choose organization</option>
            {gyms.map((g) => (
              <option key={g.gymId} value={g.gymId}>
                {g.gymName}
              </option>
            ))}
          </select>
        </label>
      );
    return <p>No assigned Gym organization.</p>;
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <Send className="h-7 w-7 text-cyan-400" />
            {isVi ? 'Lời Mời Cấp Pass Cho Hội Viên' : 'Pass Distribution Offers'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isVi
              ? 'Gửi lời mời nhận AI Pass cho hội viên Active. Mỗi lời mời giữ chỗ 1 credit trong 14 ngày cho đến khi hội viên phản hồi.'
              : 'Issue AI Pass offers to active members. Each offer reserves 1 credit for 14 days until accepted or expired.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadData()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            {isVi ? 'Làm mới' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
          >
            <Plus className="h-4 w-4" />
            {isVi ? 'Gửi Lời Mời Mới' : 'Send New Offer'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              isVi
                ? 'Tìm kiếm theo tên hoặc email hội viên...'
                : 'Search by member name or email...'
            }
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">{isVi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
            <option value="Pending">{isVi ? 'Chờ kích hoạt (Pending)' : 'Pending'}</option>
            <option value="Accepted">{isVi ? 'Đã kích hoạt (Accepted)' : 'Accepted'}</option>
            <option value="Declined">{isVi ? 'Đã từ chối (Declined)' : 'Declined'}</option>
            <option value="Cancelled">{isVi ? 'Đã hủy (Cancelled)' : 'Cancelled'}</option>
            <option value="Expired">{isVi ? 'Quá hạn (Expired)' : 'Expired'}</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">{isVi ? 'Hội viên' : 'Member'}</th>
                <th className="px-4 py-3">{isVi ? 'Loại Pass' : 'Pass Type'}</th>
                <th className="px-4 py-3">{isVi ? 'Chương trình' : 'Program'}</th>
                <th className="px-4 py-3">{isVi ? 'Ngày gửi' : 'Sent Date'}</th>
                <th className="px-4 py-3">{isVi ? 'Hạn phản hồi' : 'Expires At'}</th>
                <th className="px-4 py-3">{isVi ? 'Trạng thái' : 'Status'}</th>
                <th className="px-4 py-3 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => (
                  <tr key={offer.id} className="transition hover:bg-slate-800/30">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">
                        {offer.memberFullName || 'Hội viên'}
                      </div>
                      <div className="text-xs text-slate-400">{offer.memberEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-cyan-300">{offer.passTypeName}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">
                      {offer.programName || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-300">
                      {new Date(offer.offerSentAtUtc).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-300">
                      {new Date(offer.expiresAtUtc).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(offer.status)}</td>
                    <td className="px-4 py-3.5 text-right">
                      {offer.status === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => void handleCancelOffer(offer.id)}
                          className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-300"
                        >
                          {isVi ? 'Hủy lời mời' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    {loading
                      ? isVi
                        ? 'Đang tải dữ liệu...'
                        : 'Loading...'
                      : isVi
                        ? 'Không tìm thấy lời mời nào.'
                        : 'No offers found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Offer Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <Send className="h-5 w-5 text-cyan-400" />
              {isVi ? 'Gửi Lời Mời Cấp AI Pass' : 'Issue AI Pass Offer'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {isVi
                ? 'Hội viên nhận pass bắt buộc phải có GymMembership Active tại thương hiệu Gym của bạn.'
                : 'Recipients must have an active GymMembership with your gym organization.'}
            </p>

            <form onSubmit={handleSendOffer} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="distribution-recipient"
                  className="mb-1.5 block text-xs font-medium text-slate-300"
                >
                  {isVi ? 'Hội viên nhận thẻ' : 'Recipient'}
                </label>
                <select
                  id="distribution-recipient"
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  required
                >
                  <option value="">{isVi ? 'Chọn hội viên' : 'Select an active member'}</option>
                  {recipients.map((m) => (
                    <option key={m.memberProfileId} value={m.memberProfileId}>
                      {m.fullName} · {m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi ? 'Loại AI Pass cấp' : 'Pass Type'}
                </label>
                <select
                  aria-label="Pass Type"
                  value={selectedPassTypeId}
                  onChange={(e) => setSelectedPassTypeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  {passTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name} ({pt.durationDays} ngày)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi
                    ? 'Áp dụng mẫu chương trình (Tùy chọn)'
                    : 'Distribution Program Template (Optional)'}
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => {
                    setSelectedProgramId(e.target.value);
                    const prog = programs.find((p) => p.id === e.target.value);
                    if (prog?.messageTemplate) setOfferMessage(prog.messageTemplate);
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">{isVi ? '-- Không áp dụng mẫu --' : '-- No Template --'}</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.passTypeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi ? 'Lời nhắn kèm theo lời mời' : 'Offer Message'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    isVi
                      ? 'Chào bạn, phòng tập gửi tặng bạn gói AI Pass trải nghiệm!'
                      : 'Enjoy your complimentary AI Pass from us!'
                  }
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-slate-800/60 p-3 text-xs text-amber-300/90">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  {isVi
                    ? '1 credit tương ứng trong kho sẽ chuyển sang trạng thái Reserved trong 14 ngày. Nếu hội viên từ chối hoặc hết hạn, credit sẽ được trả lại kho khả dụng.'
                    : '1 matching credit in inventory will transition to Reserved for 14 days. If rejected or expired, it automatically releases back to Available.'}
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={sendingOffer}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
                >
                  {sendingOffer
                    ? isVi
                      ? 'Đang gửi...'
                      : 'Sending...'
                    : isVi
                      ? 'Gửi lời mời'
                      : 'Send Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
