import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  FileText,
  Layers,
  Plus,
  RefreshCw,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { passDistributionApi } from '../api/passDistributionApi';
import type {
  DistributionProgramDto,
  GymDistributionAgreementDto,
  PassCreditInventoryDto,
  PassTypeDto,
} from '../types';

import { useAuthStore } from '@/features/auth/model/useAuthStore';

const formatCurrencyVND = (amount: number) => amount.toLocaleString('vi-VN') + ' ₫';

export function GymPassDistributionPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const user = useAuthStore((state) => state.user);
  const gymId = user?.tenantId ?? '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inventory, setInventory] = useState<PassCreditInventoryDto | null>(null);
  const [agreements, setAgreements] = useState<GymDistributionAgreementDto[]>([]);
  const [programs, setPrograms] = useState<DistributionProgramDto[]>([]);
  const [passTypes, setPassTypes] = useState<PassTypeDto[]>([]);

  // Top-Up Modal State
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedAgreementId, setSelectedAgreementId] = useState('');
  const [selectedPassTypeId, setSelectedPassTypeId] = useState('');
  const [topUpQuantity, setTopUpQuantity] = useState(20);
  const [topUpSubmitting, setTopUpSubmitting] = useState(false);

  // New Program Modal State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [progPassTypeId, setProgPassTypeId] = useState('');
  const [progName, setProgName] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progMsg, setProgMsg] = useState('');
  const [progSubmitting, setProgSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!gymId) return;
    try {
      setLoading(true);
      setError(null);
      const [invData, agrData, progData, typesData] = await Promise.all([
        passDistributionApi.getGymInventory(gymId),
        passDistributionApi.getGymAgreements(gymId),
        passDistributionApi.getGymPrograms(gymId),
        passDistributionApi.getPassTypes(true),
      ]);
      setInventory(invData);
      setAgreements(agrData);
      setPrograms(progData);
      setPassTypes(typesData);
      const firstAgr = agrData[0];
      if (firstAgr) setSelectedAgreementId(firstAgr.id);
      const firstType = typesData[0];
      if (firstType) {
        setSelectedPassTypeId(firstType.id);
        setProgPassTypeId(firstType.id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu phân phối pass');
    } finally {
      setLoading(false);
    }
  }, [gymId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !selectedAgreementId || !selectedPassTypeId) return;
    try {
      setTopUpSubmitting(true);
      const passType = passTypes.find((p) => p.id === selectedPassTypeId);
      const unitPrice = passType?.wholesaleCreditPrice ?? 100_000;

      await passDistributionApi.topUpCredits(gymId, {
        agreementId: selectedAgreementId,
        passTypeId: selectedPassTypeId,
        quantity: topUpQuantity,
        unitPrice,
      });

      setShowTopUpModal(false);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Top-up thất bại');
    } finally {
      setTopUpSubmitting(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId || !progPassTypeId || !progName.trim()) return;
    try {
      setProgSubmitting(true);
      await passDistributionApi.createProgram(gymId, {
        passTypeId: progPassTypeId,
        name: progName.trim(),
        description: progDesc.trim(),
        messageTemplate: progMsg.trim() || undefined,
      });

      setProgName('');
      setProgDesc('');
      setProgMsg('');
      setShowProgramModal(false);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Tạo chương trình thất bại');
    } finally {
      setProgSubmitting(false);
    }
  };

  if (!gymId) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-200">
        <Building2 className="mb-2 h-8 w-8 text-amber-400" />
        <h3 className="text-lg font-semibold">
          {isVi ? 'Chưa xác định phòng Gym' : 'No Gym Organization Identified'}
        </h3>
        <p className="text-sm text-slate-300">
          {isVi
            ? 'Vui lòng hoàn tất đăng ký thông tin thương hiệu trước khi truy cập quản lý phân phối AI Pass.'
            : 'Please complete your gym onboarding before accessing AI Pass distribution.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {isVi
                ? 'Quản lý Kho Pass Credit & Gói Phân Phối'
                : 'Pass Credit Inventory & Packages'}
            </h1>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
              CF03 TO-BE v2.1
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {isVi
              ? 'FitFlex cung cấp quyền phân phối AI Access Pass trả trước. Bạn tự quản lý kho credit và chính sách cấp pass cho hội viên.'
              : 'FitFlex provides prepaid AI Access Passes. You manage inventory and issuance policies for your gym members.'}
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
            onClick={() => setShowTopUpModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
          >
            <Plus className="h-4 w-4" />
            {isVi ? 'Mua Top-Up Credits' : 'Top-Up Credits'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              {isVi ? 'Credit Khả Dụng (Available)' : 'Available Credits'}
            </span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (inventory?.totalAvailable ?? 0)}
            </span>
            <span className="text-xs font-medium text-emerald-400">
              {isVi ? 'sẵn sàng cấp' : 'ready to issue'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              {isVi ? 'Đang Giữ Chỗ (Reserved)' : 'Reserved Credits'}
            </span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (inventory?.totalReserved ?? 0)}
            </span>
            <span className="text-xs font-medium text-amber-400">
              {isVi ? 'lời mời đang chờ' : 'pending offers'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              {isVi ? 'Đã Tiêu Thụ (Consumed)' : 'Consumed Credits'}
            </span>
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (inventory?.totalConsumed ?? 0)}
            </span>
            <span className="text-xs font-medium text-cyan-400">
              {isVi ? 'hội viên đã kích hoạt' : 'activated by members'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">
              {isVi ? 'Đã Hết Hạn (Expired)' : 'Expired Credits'}
            </span>
            <div className="rounded-xl bg-slate-700/40 p-2 text-slate-400">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (inventory?.totalExpired ?? 0)}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {isVi ? 'không rollover' : 'non-rollover'}
            </span>
          </div>
        </div>
      </div>

      {/* Credit Inventory By Pass Type */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">
              {isVi ? 'Bóc Tách Tồn Kho Theo Loại Pass' : 'Inventory Breakdown by Pass Type'}
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">{isVi ? 'Loại Pass' : 'Pass Type'}</th>
                <th className="px-4 py-3">{isVi ? 'Mã Pass' : 'Code'}</th>
                <th className="px-4 py-3 text-emerald-400">{isVi ? 'Khả dụng' : 'Available'}</th>
                <th className="px-4 py-3 text-amber-400">{isVi ? 'Giữ chỗ' : 'Reserved'}</th>
                <th className="px-4 py-3 text-cyan-400">{isVi ? 'Đã kích hoạt' : 'Consumed'}</th>
                <th className="px-4 py-3 text-slate-400">{isVi ? 'Hết hạn' : 'Expired'}</th>
                <th className="px-4 py-3">{isVi ? 'Hạn sớm nhất' : 'Nearest Expiry'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {inventory?.byPassType && inventory.byPassType.length > 0 ? (
                inventory.byPassType.map((item) => (
                  <tr key={item.passTypeId} className="transition hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-semibold text-white">{item.passTypeName}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                      {item.passTypeCode}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400">{item.available}</td>
                    <td className="px-4 py-3.5 font-medium text-amber-400">{item.reserved}</td>
                    <td className="px-4 py-3.5 font-medium text-cyan-400">{item.consumed}</td>
                    <td className="px-4 py-3.5 text-slate-400">{item.expired}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-300">
                      {item.nearestExpirationUtc
                        ? new Date(item.nearestExpirationUtc).toLocaleDateString(
                            isVi ? 'vi-VN' : 'en-US',
                          )
                        : '—'}
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
                        ? 'Chưa có credit nào trong kho.'
                        : 'No credits in inventory.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agreements and Programs Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Agreements */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">
              {isVi ? 'Hợp Đồng Phân Phối B2B' : 'Distribution Agreements'}
            </h2>
          </div>

          <div className="space-y-3">
            {agreements.length > 0 ? (
              agreements.map((agr) => (
                <div
                  key={agr.id}
                  className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{agr.packageName}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        agr.status === 'Active'
                          ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                          : 'border-slate-600 bg-slate-700 text-slate-300'
                      }`}
                    >
                      {agr.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>
                      {isVi ? 'Số HĐ:' : 'Agreement #:'}{' '}
                      <strong className="text-slate-200">{agr.agreementNumber}</strong>
                    </span>
                    <span>
                      {isVi ? 'Hạn:' : 'Expires:'}{' '}
                      <strong className="text-slate-200">
                        {new Date(agr.expiresAtUtc).toLocaleDateString(isVi ? 'vi-VN' : 'en-US')}
                      </strong>
                    </span>
                    <span>
                      {isVi ? 'Trainer AI:' : 'Trainer AI:'}{' '}
                      <strong
                        className={agr.hasTrainerAiAccess ? 'text-cyan-400' : 'text-slate-400'}
                      >
                        {agr.hasTrainerAiAccess
                          ? isVi
                            ? 'BẬT'
                            : 'ENABLED'
                          : isVi
                            ? 'TẮT'
                            : 'DISABLED'}
                      </strong>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                {isVi ? 'Chưa có hợp đồng phân phối nào.' : 'No distribution agreements found.'}
              </p>
            )}
          </div>
        </div>

        {/* Distribution Programs */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                {isVi ? 'Chương Trình Phân Phối' : 'Distribution Programs'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowProgramModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20"
            >
              <Plus className="h-3.5 w-3.5" />
              {isVi ? 'Tạo mẫu' : 'New Template'}
            </button>
          </div>

          <div className="space-y-3">
            {programs.length > 0 ? (
              programs.map((prog) => (
                <div
                  key={prog.id}
                  className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{prog.name}</span>
                    <span className="rounded-md bg-slate-700/60 px-2 py-0.5 font-mono text-xs text-slate-300">
                      {prog.passTypeName}
                    </span>
                  </div>
                  {prog.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">{prog.description}</p>
                  )}
                  {prog.messageTemplate && (
                    <div className="mt-2 rounded bg-slate-900/50 p-2 text-xs italic text-slate-300">
                      &quot;{prog.messageTemplate}&quot;
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                {isVi ? 'Chưa tạo mẫu chương trình nào.' : 'No distribution program templates yet.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top-Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <Coins className="h-5 w-5 text-cyan-400" />
              {isVi ? 'Mua Bổ Sung Credit (Top-Up)' : 'Top-Up Credits'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {isVi
                ? 'Lô credit top-up có hạn phát hành không vượt quá ngày hết hạn của hợp đồng hiện hành.'
                : 'Top-up credit lot expiration strictly cannot exceed active agreement expiration.'}
            </p>

            <form onSubmit={handleTopUpSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi ? 'Hợp đồng phân phối' : 'Distribution Agreement'}
                </label>
                <select
                  value={selectedAgreementId}
                  onChange={(e) => setSelectedAgreementId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  {agreements.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.packageName} ({a.agreementNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi ? 'Loại AI Pass' : 'Pass Type'}
                </label>
                <select
                  value={selectedPassTypeId}
                  onChange={(e) => setSelectedPassTypeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  {passTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name} — {formatCurrencyVND(pt.wholesaleCreditPrice)}/credit
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi ? 'Số lượng credit mua thêm' : 'Quantity to Top-Up'}
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={topUpQuantity}
                  onChange={(e) => setTopUpQuantity(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1 rounded-lg bg-slate-800/60 p-3 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>{isVi ? 'Đơn giá sỉ:' : 'Wholesale unit price:'}</span>
                  <span className="font-semibold text-white">
                    {formatCurrencyVND(
                      passTypes.find((p) => p.id === selectedPassTypeId)?.wholesaleCreditPrice ?? 0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1 font-bold text-cyan-400">
                  <span>{isVi ? 'Tổng tiền:' : 'Total:'}</span>
                  <span>
                    {formatCurrencyVND(
                      (passTypes.find((p) => p.id === selectedPassTypeId)?.wholesaleCreditPrice ??
                        0) * topUpQuantity,
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={topUpSubmitting}
                  className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
                >
                  {topUpSubmitting
                    ? isVi
                      ? 'Đang xử lý...'
                      : 'Processing...'
                    : isVi
                      ? 'Xác nhận mua'
                      : 'Confirm Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program Template Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="flex items-center gap-2 text-xl font-bold text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              {isVi ? 'Tạo Mẫu Chương Trình Phân Phối' : 'Create Distribution Program'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {isVi
                ? 'Mẫu chương trình chỉ là nhãn và lời nhắn gợi ý, không có giá tiền trên FitFlex.'
                : 'Program templates provide labels and offer messages without price tracking on FitFlex.'}
            </p>

            <form onSubmit={handleCreateProgram} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi ? 'Tên chương trình' : 'Program Name'}
                </label>
                <input
                  type="text"
                  placeholder={
                    isVi
                      ? 'Ví dụ: Tặng AI 3 tháng kèm thẻ năm'
                      : 'e.g. 3-Month AI Pass with Annual Membership'
                  }
                  value={progName}
                  onChange={(e) => setProgName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi ? 'Loại AI Pass cấp' : 'Pass Type'}
                </label>
                <select
                  value={progPassTypeId}
                  onChange={(e) => setProgPassTypeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
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
                  {isVi ? 'Mô tả chương trình' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={progDesc}
                  onChange={(e) => setProgDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  {isVi ? 'Lời nhắn mẫu gửi Member' : 'Message Template'}
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    isVi
                      ? 'Chào bạn, chúc mừng bạn nhận được AI Pass độc quyền!'
                      : 'Welcome! Enjoy your exclusive AI Pass!'
                  }
                  value={progMsg}
                  onChange={(e) => setProgMsg(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  {isVi ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={progSubmitting}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50"
                >
                  {progSubmitting
                    ? isVi
                      ? 'Đang tạo...'
                      : 'Creating...'
                    : isVi
                      ? 'Tạo chương trình'
                      : 'Create Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
