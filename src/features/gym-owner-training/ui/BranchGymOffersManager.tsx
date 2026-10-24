import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { toast } from 'sonner';

import {
  marketplaceApi,
  type CreateGymOfferRequest,
  type GymBranchCardView,
  type GymOfferView,
} from '@/features/marketplace';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
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
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { WorkspacePanel } from '@/shared/ui/workspace';

function formatVnd(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

interface OfferFormData {
  id?: string;
  title: string;
  description: string;
  durationType: 'Day' | 'Month' | 'Year';
  durationValue: number;
  gymServicePrice: number;
  usageScope: 'SingleBranch' | 'EligibleOrganizationBranches';
  sessionsIncluded: string;
  minNoticeHours: number;
  isPublished: boolean;
}

const emptyOfferForm: OfferFormData = {
  title: '',
  description: '',
  durationType: 'Month',
  durationValue: 1,
  gymServicePrice: 500000,
  usageScope: 'SingleBranch',
  sessionsIncluded: '',
  minNoticeHours: 24,
  isPublished: true,
};

export function BranchGymOffersManager() {
  const { language, locale } = useLocale();
  const isVi = language === 'vi';

  const [branches, setBranches] = useState<GymBranchCardView[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [offers, setOffers] = useState<GymOfferView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Approved' | 'PendingAdminReview' | 'Rejected'
  >('all');

  // Modal dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferFormData>(emptyOfferForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form field IDs for accessibility
  const titleId = useId();
  const descId = useId();
  const durationTypeId = useId();
  const durationValId = useId();
  const priceId = useId();
  const scopeId = useId();
  const sessionsId = useId();
  const noticeId = useId();

  // 1. Load branches on mount
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const myBrands = await marketplaceApi.getMyBrands();
        let branchList: GymBranchCardView[] = [];
        if (myBrands && myBrands.length > 0) {
          branchList = await marketplaceApi.getBrandBranches(myBrands[0]!.id);
        }
        if (!branchList || branchList.length === 0) {
          branchList = await marketplaceApi.getBranches();
        }
        if (active && branchList && branchList.length > 0) {
          setBranches(branchList);
          setSelectedBranchId(branchList[0]!.id);
        }
      } catch {
        if (active) {
          // Fallback branch if unseeded
          const fallback: GymBranchCardView = {
            id: 'branch-main',
            gymId: 'b0000000-0000-0000-0000-000000000001',
            brandName: 'Fit Central',
            branchName: 'Fit Central District 1',
            addressLine1: '123 Đường Nguyễn Huệ, Phường Bến Nghé',
            city: 'Hồ Chí Minh',
            latitude: 10.7769,
            longitude: 106.7009,
            averageRating: 4.8,
            reviewCount: 38,
          };
          setBranches([fallback]);
          setSelectedBranchId('branch-main');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // 2. Load offers when selected branch changes
  const loadOffers = useCallback(
    async (branchId: string, showToast = false) => {
      if (!branchId) return;
      setIsLoading(true);
      try {
        const data = await marketplaceApi.getBranchOffers(branchId);
        setOffers(data ?? []);
        if (showToast) {
          toast.success(isVi ? 'Đã cập nhật danh sách gói tập.' : 'Gym offers refreshed.');
        }
      } catch {
        toast.error(isVi ? 'Không thể tải gói tập chi nhánh.' : 'Could not load branch offers.');
        setOffers([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isVi],
  );

  useEffect(() => {
    if (selectedBranchId) {
      void loadOffers(selectedBranchId);
    }
  }, [selectedBranchId, loadOffers]);

  const handleOpenCreate = () => {
    setEditingOffer(emptyOfferForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (offer: GymOfferView) => {
    setEditingOffer({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      durationType: (offer.durationType as 'Day' | 'Month' | 'Year') || 'Month',
      durationValue: offer.durationValue,
      gymServicePrice: offer.gymServicePrice,
      usageScope: 'SingleBranch',
      sessionsIncluded: '',
      minNoticeHours: offer.minNoticeHours ?? 24,
      isPublished: offer.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleTogglePublish = async (offer: GymOfferView) => {
    try {
      const nextPublished = !offer.isPublished;
      await marketplaceApi.updateOffer(offer.id, { isPublished: nextPublished });
      setOffers((prev) =>
        prev.map((item) => (item.id === offer.id ? { ...item, isPublished: nextPublished } : item)),
      );
      toast.success(
        nextPublished
          ? isVi
            ? `Đã mở bán gói "${offer.title}".`
            : `Offer "${offer.title}" is now published.`
          : isVi
            ? `Đã tạm ẩn gói "${offer.title}".`
            : `Offer "${offer.title}" is now hidden.`,
      );
    } catch {
      toast.error(
        isVi ? 'Không thể thay đổi trạng thái mở bán.' : 'Failed to update publish state.',
      );
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) {
      toast.error(isVi ? 'Vui lòng chọn chi nhánh áp dụng.' : 'Please select a branch.');
      return;
    }
    if (!editingOffer.title.trim()) {
      toast.error(isVi ? 'Vui lòng nhập tên gói tập.' : 'Please enter an offer title.');
      return;
    }
    if (editingOffer.gymServicePrice <= 0) {
      toast.error(isVi ? 'Giá gói tập phải lớn hơn 0 đ.' : 'Price must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const req: CreateGymOfferRequest = {
        title: editingOffer.title.trim(),
        description: editingOffer.description.trim(),
        durationType: editingOffer.durationType,
        durationValue: Number(editingOffer.durationValue) || 1,
        gymServicePrice: Number(editingOffer.gymServicePrice) || 0,
        includesPlus: false,
        plusDurationDays: 0,
        plusPrice: 0,
        isPublished: editingOffer.isPublished,
        usageScope: editingOffer.usageScope,
        sessionsIncluded: editingOffer.sessionsIncluded
          ? Number(editingOffer.sessionsIncluded)
          : undefined,
        minNoticeHours: Number(editingOffer.minNoticeHours) || 24,
      };

      if (editingOffer.id) {
        // Edit mode
        await marketplaceApi.updateOffer(editingOffer.id, req);
        toast.success(
          isVi
            ? 'Đã cập nhật gói tập thành công. Hệ thống đã đưa gói vào hàng đợi xét duyệt.'
            : 'Offer updated and queued for review.',
        );
      } else {
        // Create mode
        await marketplaceApi.createBranchOffer(selectedBranchId, req);
        toast.success(
          isVi
            ? 'Đã tạo gói tập thành công! Gói đang chờ Platform Admin xét duyệt trước khi hiển thị trên sàn.'
            : 'Offer created! Waiting for Platform Admin review before marketplace listing.',
        );
      }
      setIsDialogOpen(false);
      void loadOffers(selectedBranchId);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : isVi ? 'Thao tác thất bại.' : 'Operation failed.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered offers
  const filteredOffers = offers.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalCount = offers.length;
  const approvedCount = offers.filter((o) => o.approvalStatus === 'Approved').length;
  const pendingCount = offers.filter((o) => o.approvalStatus === 'PendingAdminReview').length;
  const rejectedCount = offers.filter((o) => o.approvalStatus === 'Rejected').length;

  const currentBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <div className="gym-training-page" style={{ display: 'grid', gap: '20px' }}>
      {/* 1. Branch Selector & Top Action Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          background: 'hsl(var(--card))',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--energy-lime-faint, #f0fdf4)',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={22} />
          </div>
          <div>
            <span
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'hsl(var(--muted-foreground))',
                fontWeight: 700,
              }}
            >
              {isVi ? 'Chi nhánh quản lý' : 'Selected Branch'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <Select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                style={{ fontWeight: 600, minWidth: '220px' }}
                aria-label={isVi ? 'Chọn chi nhánh' : 'Select branch'}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.brandName ? `${b.brandName} - ${b.branchName}` : b.branchName}
                  </option>
                ))}
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsRefreshing(true);
                  void loadOffers(selectedBranchId, true);
                }}
                disabled={isLoading || isRefreshing}
                title={isVi ? 'Làm mới' : 'Refresh'}
              >
                <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            onClick={handleOpenCreate}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            <span>{isVi ? 'Tạo gói tập mới' : 'Create New Offer'}</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: 'hsl(var(--card))',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '12px',
            }}
          >
            <span>{isVi ? 'Tổng số gói' : 'Total Offers'}</span>
            <Package size={17} />
          </div>
          <strong style={{ fontSize: '24px', display: 'block', marginTop: '8px' }}>
            {totalCount}
          </strong>
          <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            {currentBranch?.branchName}
          </span>
        </div>

        <div
          style={{
            background: 'hsl(var(--card))',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#16a34a',
              fontSize: '12px',
            }}
          >
            <span>{isVi ? 'Đã duyệt (Live)' : 'Approved (Live)'}</span>
            <CheckCircle2 size={17} />
          </div>
          <strong
            style={{ fontSize: '24px', display: 'block', marginTop: '8px', color: '#16a34a' }}
          >
            {approvedCount}
          </strong>
          <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            {isVi ? 'Hiển thị trên sàn' : 'Visible on marketplace'}
          </span>
        </div>

        <div
          style={{
            background: 'hsl(var(--card))',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#d97706',
              fontSize: '12px',
            }}
          >
            <span>{isVi ? 'Chờ Admin duyệt' : 'Pending Review'}</span>
            <Clock size={17} />
          </div>
          <strong
            style={{ fontSize: '24px', display: 'block', marginTop: '8px', color: '#d97706' }}
          >
            {pendingCount}
          </strong>
          <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            {isVi ? 'Đang trong hàng đợi' : 'In review queue'}
          </span>
        </div>

        <div
          style={{
            background: 'hsl(var(--card))',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid hsl(var(--border))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#dc2626',
              fontSize: '12px',
            }}
          >
            <span>{isVi ? 'Bị từ chối' : 'Rejected'}</span>
            <AlertCircle size={17} />
          </div>
          <strong
            style={{ fontSize: '24px', display: 'block', marginTop: '8px', color: '#dc2626' }}
          >
            {rejectedCount}
          </strong>
          <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            {isVi ? 'Cần chỉnh sửa' : 'Needs adjustments'}
          </span>
        </div>
      </div>

      {/* 3. Search and Status Filter */}
      <WorkspacePanel style={{ padding: '16px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'hsl(var(--muted-foreground))',
              }}
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isVi ? 'Tìm kiếm theo tên gói tập...' : 'Search offers by title...'}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={15} style={{ color: 'hsl(var(--muted-foreground))' }} />
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              {isVi ? 'Tất cả' : 'All'} ({totalCount})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'Approved' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('Approved')}
            >
              {isVi ? 'Đã duyệt' : 'Approved'} ({approvedCount})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'PendingAdminReview' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PendingAdminReview')}
            >
              {isVi ? 'Chờ duyệt' : 'Pending'} ({pendingCount})
            </Button>
            {rejectedCount > 0 && (
              <Button
                size="sm"
                variant={statusFilter === 'Rejected' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('Rejected')}
              >
                {isVi ? 'Bị từ chối' : 'Rejected'} ({rejectedCount})
              </Button>
            )}
          </div>
        </div>

        {/* 4. Offers List / Grid */}
        <div style={{ marginTop: '20px' }}>
          {isLoading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
              <p>{isVi ? 'Đang tải danh sách gói tập...' : 'Loading offers...'}</p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 16px',
                background: 'var(--energy-lime-faint, #f9fafb)',
                borderRadius: '10px',
                border: '1px dashed hsl(var(--border))',
              }}
            >
              <Package
                size={36}
                style={{ margin: '0 auto 12px', color: 'hsl(var(--muted-foreground))' }}
              />
              <h3 style={{ fontSize: '15px', fontWeight: 600 }}>
                {isVi ? 'Chưa có gói tập nào' : 'No offers found'}
              </h3>
              <p
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '13px',
                  marginTop: '4px',
                  maxWidth: '400px',
                  margin: '4px auto 16px',
                }}
              >
                {isVi
                  ? 'Hãy tạo gói hội viên đầu tiên để đăng ký mở bán trên nền tảng Marketplace của hệ thống.'
                  : 'Create your first gym membership package to start selling on the marketplace.'}
              </p>
              <Button onClick={handleOpenCreate} size="sm">
                <Plus size={15} style={{ marginRight: '6px' }} />
                {isVi ? 'Tạo gói tập ngay' : 'Create Offer Now'}
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredOffers.map((offer) => {
                const isApproved = offer.approvalStatus === 'Approved';
                const isPending = offer.approvalStatus === 'PendingAdminReview';
                const isRejected = offer.approvalStatus === 'Rejected';

                const durationLabel =
                  offer.durationType === 'Month'
                    ? `${offer.durationValue} ${isVi ? 'Tháng' : 'Months'}`
                    : offer.durationType === 'Year'
                      ? `${offer.durationValue} ${isVi ? 'Năm' : 'Years'}`
                      : `${offer.durationValue} ${isVi ? 'Ngày' : 'Days'}`;

                return (
                  <article
                    key={offer.id}
                    style={{
                      background: 'hsl(var(--card))',
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div>
                      {/* Status Badges */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'var(--energy-lime-faint, #f0fdf4)',
                            color: '#166534',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CalendarDays size={13} /> {durationLabel}
                        </span>

                        <div>
                          {isApproved && (
                            <Badge
                              variant="accent"
                              style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #86efac',
                              }}
                            >
                              <CheckCircle2 size={12} style={{ marginRight: 3 }} />{' '}
                              {isVi ? 'Đã duyệt' : 'Approved'}
                            </Badge>
                          )}
                          {isPending && (
                            <Badge
                              variant="neutral"
                              style={{
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                              }}
                            >
                              <Clock size={12} style={{ marginRight: 3 }} />{' '}
                              {isVi ? 'Chờ duyệt' : 'Pending'}
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge
                              variant="neutral"
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fca5a5',
                              }}
                            >
                              <AlertCircle size={12} style={{ marginRight: 3 }} />{' '}
                              {isVi ? 'Bị từ chối' : 'Rejected'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Offer Title & Price */}
                      <h4
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          marginBottom: '6px',
                          color: 'hsl(var(--foreground))',
                        }}
                      >
                        {offer.title}
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '6px',
                          marginBottom: '12px',
                        }}
                      >
                        <strong
                          style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            color: 'var(--brand, #16a34a)',
                          }}
                        >
                          {formatVnd(offer.gymServicePrice, locale)}
                        </strong>
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'hsl(var(--muted-foreground))',
                          lineHeight: 1.5,
                          marginBottom: '16px',
                          minHeight: '38px',
                        }}
                      >
                        {offer.description ||
                          (isVi ? 'Không có mô tả chi tiết.' : 'No description provided.')}
                      </p>

                      {/* Features / Properties */}
                      <div
                        style={{
                          fontSize: '12px',
                          display: 'grid',
                          gap: '6px',
                          borderTop: '1px solid hsl(var(--border))',
                          paddingTop: '12px',
                          color: 'hsl(var(--muted-foreground))',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{isVi ? 'Trạng thái mở bán:' : 'Marketplace State:'}</span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: offer.isPublished ? '#16a34a' : 'inherit',
                            }}
                          >
                            {offer.isPublished
                              ? isVi
                                ? 'Đang mở bán'
                                : 'Published'
                              : isVi
                                ? 'Tạm ẩn'
                                : 'Hidden'}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{isVi ? 'Huỷ/dời miễn phí:' : 'Free cancellation:'}</span>
                          <span>
                            {offer.minNoticeHours ?? 24} {isVi ? 'giờ trước' : 'hours notice'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '16px',
                        borderTop: '1px solid hsl(var(--border))',
                        paddingTop: '14px',
                      }}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                        onClick={() => handleOpenEdit(offer)}
                      >
                        <Edit3 size={14} /> {isVi ? 'Chỉnh sửa' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => void handleTogglePublish(offer)}
                        title={
                          offer.isPublished
                            ? isVi
                              ? 'Tạm ẩn gói'
                              : 'Hide offer'
                            : isVi
                              ? 'Mở bán gói'
                              : 'Publish offer'
                        }
                      >
                        {offer.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                        <span>
                          {offer.isPublished ? (isVi ? 'Ẩn' : 'Hide') : isVi ? 'Hiện' : 'Show'}
                        </span>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </WorkspacePanel>

      {/* 5. Create / Edit Offer Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent style={{ maxWidth: '580px' }}>
          <DialogHeader>
            <DialogTitle>
              {editingOffer.id
                ? isVi
                  ? 'Chỉnh sửa gói tập hội viên'
                  : 'Edit Gym Membership Offer'
                : isVi
                  ? 'Tạo gói tập hội viên mới'
                  : 'Create Gym Membership Offer'}
            </DialogTitle>
            <DialogDescription>
              {isVi
                ? 'Gói tập sau khi tạo sẽ được gửi tới Platform Admin để kiểm duyệt trước khi hiển thị trên sàn Marketplace.'
                : 'Offers will be submitted to the platform admin for review before appearing on the public marketplace.'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => void handleSubmitOffer(e)}
            style={{ display: 'grid', gap: '14px', marginTop: '8px' }}
          >
            <div>
              <Label htmlFor={titleId} style={{ fontWeight: 600 }}>
                {isVi ? 'Tên gói tập (Bắt buộc)' : 'Offer Title (Required)'}
              </Label>
              <Input
                id={titleId}
                required
                value={editingOffer.title}
                onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                placeholder={
                  isVi ? 'VD: Thẻ Hội Viên Tiết Kiệm 3 Tháng' : 'e.g. 3-Month Membership Pass'
                }
                style={{ marginTop: '5px' }}
              />
            </div>

            <div>
              <Label htmlFor={descId} style={{ fontWeight: 600 }}>
                {isVi ? 'Mô tả & quyền lợi gói' : 'Description & Benefits'}
              </Label>
              <Textarea
                id={descId}
                rows={3}
                value={editingOffer.description}
                onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                placeholder={
                  isVi
                    ? 'VD: Không giới hạn thời gian tập máy cardio, khu tạ tự do, tủ locker và phòng tắm nóng lạnh...'
                    : 'Full gym floor access, cardio, lockers...'
                }
                style={{ marginTop: '5px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <Label htmlFor={durationTypeId} style={{ fontWeight: 600 }}>
                  {isVi ? 'Đơn vị thời hạn' : 'Duration Type'}
                </Label>
                <Select
                  id={durationTypeId}
                  value={editingOffer.durationType}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      durationType: e.target.value as 'Day' | 'Month' | 'Year',
                    })
                  }
                  style={{ marginTop: '5px' }}
                >
                  <option value="Day">{isVi ? 'Ngày' : 'Day'}</option>
                  <option value="Month">{isVi ? 'Tháng' : 'Month'}</option>
                  <option value="Year">{isVi ? 'Năm' : 'Year'}</option>
                </Select>
              </div>

              <div>
                <Label htmlFor={durationValId} style={{ fontWeight: 600 }}>
                  {isVi ? 'Thời lượng' : 'Duration Value'}
                </Label>
                <Input
                  id={durationValId}
                  type="number"
                  min={1}
                  required
                  value={editingOffer.durationValue}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      durationValue: Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                  style={{ marginTop: '5px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <Label htmlFor={priceId} style={{ fontWeight: 600 }}>
                  {isVi ? 'Giá dịch vụ phòng gym (VND)' : 'Gym Service Price (VND)'}
                </Label>
                <Input
                  id={priceId}
                  type="number"
                  min={1000}
                  step={10000}
                  required
                  value={editingOffer.gymServicePrice}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      gymServicePrice: Math.max(0, parseInt(e.target.value, 10) || 0),
                    })
                  }
                  style={{ marginTop: '5px' }}
                />
              </div>

              <div>
                <Label htmlFor={sessionsId} style={{ fontWeight: 600 }}>
                  {isVi ? 'Số buổi tập (Tùy chọn)' : 'Sessions (Optional)'}
                </Label>
                <Input
                  id={sessionsId}
                  type="number"
                  placeholder={isVi ? 'Không giới hạn' : 'Unlimited'}
                  value={editingOffer.sessionsIncluded}
                  onChange={(e) =>
                    setEditingOffer({ ...editingOffer, sessionsIncluded: e.target.value })
                  }
                  style={{ marginTop: '5px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <Label htmlFor={scopeId} style={{ fontWeight: 600 }}>
                  {isVi ? 'Phạm vi áp dụng' : 'Usage Scope'}
                </Label>
                <Select
                  id={scopeId}
                  value={editingOffer.usageScope}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      usageScope: e.target.value as 'SingleBranch' | 'EligibleOrganizationBranches',
                    })
                  }
                  style={{ marginTop: '5px' }}
                >
                  <option value="SingleBranch">
                    {isVi ? 'Chỉ chi nhánh này' : 'Single Branch'}
                  </option>
                  <option value="EligibleOrganizationBranches">
                    {isVi ? 'Toàn bộ chi nhánh cùng thương hiệu' : 'All Brand Branches'}
                  </option>
                </Select>
              </div>

              <div>
                <Label htmlFor={noticeId} style={{ fontWeight: 600 }}>
                  {isVi ? 'Huỷ/dời miễn phí (giờ)' : 'Free cancellation notice (hrs)'}
                </Label>
                <Input
                  id={noticeId}
                  type="number"
                  min={0}
                  max={720}
                  value={editingOffer.minNoticeHours}
                  onChange={(e) =>
                    setEditingOffer({
                      ...editingOffer,
                      minNoticeHours: parseInt(e.target.value, 10) || 24,
                    })
                  }
                  style={{ marginTop: '5px' }}
                />
              </div>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '6px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={editingOffer.isPublished}
                onChange={(e) =>
                  setEditingOffer({ ...editingOffer, isPublished: e.target.checked })
                }
                style={{ width: '17px', height: '17px' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>
                {isVi
                  ? 'Tự động mở bán trên Marketplace sau khi được duyệt'
                  : 'Publish to marketplace automatically when approved'}
              </span>
            </label>

            <DialogFooter style={{ marginTop: '14px' }}>
              <DialogClose asChild>
                <Button variant="ghost" type="button" disabled={isSubmitting}>
                  {isVi ? 'Hủy' : 'Cancel'}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isVi
                    ? 'Đang gửi...'
                    : 'Submitting...'
                  : editingOffer.id
                    ? isVi
                      ? 'Lưu cập nhật'
                      : 'Save Changes'
                    : isVi
                      ? 'Tạo gói tập'
                      : 'Create Offer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
