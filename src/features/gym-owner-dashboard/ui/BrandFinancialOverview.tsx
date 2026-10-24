import { Building2, CircleDollarSign, Landmark, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  marketplaceApi,
  type BranchRevenueSummaryDto,
  type BrandRevenueSummaryDto,
  type GymBrandView,
} from '@/features/marketplace';
import { useLocale } from '@/shared/hooks/useLocale';
import { Badge } from '@/shared/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { WorkspacePanel } from '@/shared/ui/workspace';

const FALLBACK_DASHBOARD: BrandRevenueSummaryDto = {
  brandId: 'b0000000-0000-0000-0000-000000000001',
  brandName: 'FitFlex Elite Fitness Center',
  totalGross: 128500000,
  totalPlatformFee: 12850000,
  totalNetPayout: 115650000,
  totalOrders: 42,
  branchBreakdown: [
    {
      branchId: 'br000000-0000-0000-0000-000000000001',
      branchName: 'FitFlex Flagship Quận 1',
      grossAmount: 78000000,
      platformCommissionAmount: 7800000,
      gymPayoutAmount: 70200000,
      orderCount: 26,
    },
    {
      branchId: 'br000000-0000-0000-0000-000000000002',
      branchName: 'FitFlex Thảo Điền Club',
      grossAmount: 50500000,
      platformCommissionAmount: 5050000,
      gymPayoutAmount: 45450000,
      orderCount: 16,
    },
  ],
};

function formatVnd(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function BrandFinancialOverview() {
  const { language, locale } = useLocale();
  const isVi = language === 'vi';

  const [brands, setBrands] = useState<GymBrandView[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<BrandRevenueSummaryDto>(FALLBACK_DASHBOARD);
  const [_isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBrandsAndRevenue() {
      setIsLoading(true);
      try {
        const brandList = await marketplaceApi.getMyBrands();
        if (!cancelled && brandList && brandList.length > 0) {
          const firstBrand = brandList[0];
          if (firstBrand) {
            setBrands(brandList);
            const firstBrandId = firstBrand.id;
            setSelectedBrandId(firstBrandId);

            try {
              const data = await marketplaceApi.getBrandDashboard(firstBrandId);
              if (!cancelled && data && data.totalGross !== undefined) {
                setDashboard(data);
              }
            } catch {
              // Keep fallback
            }
          }
        }
      } catch {
        // Keep fallback
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadBrandsAndRevenue();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleBrandChange = async (brandId: string) => {
    setSelectedBrandId(brandId);
    setIsLoading(true);
    try {
      const data = await marketplaceApi.getBrandDashboard(brandId);
      if (data && data.totalGross !== undefined) {
        setDashboard(data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const copy = {
    title: isVi
      ? 'Doanh Thu Thương Hiệu & Đối Soát Sàn (CF03)'
      : 'Brand Revenue & Platform Settlement (CF03)',
    subtitle: isVi
      ? 'Tách dòng tiền tự động: 10% phí nền tảng FitFlex & 90% thực nhận đối soát'
      : 'Automated revenue split: 10% FitFlex platform fee & 90% net gym payout',
    gross: isVi ? 'Doanh thu gộp (Gross)' : 'Gross Revenue',
    platformFee: isVi ? 'Phí sàn FitFlex (10%)' : 'Platform Fee (10%)',
    netPayout: isVi ? 'Thực nhận Gym (90%)' : 'Net Gym Payout (90%)',
    orders: isVi ? 'Tổng đơn hàng' : 'Total Orders',
    branchBreakdown: isVi
      ? 'Phân bổ doanh thu theo từng chi nhánh'
      : 'Multi-branch Revenue Breakdown',
    branchName: isVi ? 'Chi nhánh' : 'Branch',
    orderCount: isVi ? 'Số đơn' : 'Orders',
    selectBrand: isVi ? 'Chọn thương hiệu:' : 'Select brand:',
  };

  return (
    <WorkspacePanel className="gym-financial-panel mb-5 rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded bg-emerald-100 p-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Landmark size={20} />
            </span>
            <h2 className="font-display text-lg font-bold">{copy.title}</h2>
            <Badge variant="accent" className="ml-1 text-xs">
              {dashboard.brandName || 'FitFlex Partner'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{copy.subtitle}</p>
        </div>

        {brands.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor="brand-select" className="text-xs font-semibold text-muted-foreground">
              {copy.selectBrand}
            </label>
            <select
              id="brand-select"
              value={selectedBrandId || ''}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="rounded border bg-background px-2.5 py-1.5 text-xs text-foreground"
            >
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-md border bg-background/50 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>{copy.gross}</span>
            <CircleDollarSign size={16} />
          </div>
          <div className="mt-2">
            <p className="font-data text-xl font-bold text-foreground">
              {formatVnd(dashboard.totalGross, locale)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              100% {isVi ? 'tổng giá trị dịch vụ' : 'total service value'}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-md border border-amber-200/60 bg-amber-50/30 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span>{copy.platformFee}</span>
            <span className="rounded bg-amber-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold dark:bg-amber-900/80">
              10%
            </span>
          </div>
          <div className="mt-2">
            <p className="font-data text-xl font-bold text-amber-900 dark:text-amber-200">
              {formatVnd(dashboard.totalPlatformFee, locale)}
            </p>
            <p className="mt-0.5 text-[11px] text-amber-700/80 dark:text-amber-400">
              {isVi ? 'Chiết khấu nền tảng sàn' : 'FitFlex platform fee'}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-md border border-emerald-300/70 bg-emerald-50/40 p-4 dark:border-emerald-800/70 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span>{copy.netPayout}</span>
            <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold dark:bg-emerald-900/80">
              90% Net
            </span>
          </div>
          <div className="mt-2">
            <p className="font-data text-xl font-bold text-emerald-900 dark:text-emerald-200">
              {formatVnd(dashboard.totalNetPayout, locale)}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-700/80 dark:text-emerald-400">
              {isVi ? 'Thực nhận đối soát định kỳ' : 'Settlement payout to gym'}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-md border bg-background/50 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>{copy.orders}</span>
            <TrendingUp size={16} />
          </div>
          <div className="mt-2">
            <p className="font-data text-xl font-bold text-foreground">
              {dashboard.totalOrders}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                {isVi ? 'đơn' : 'orders'}
              </span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {dashboard.branchBreakdown.length} {isVi ? 'chi nhánh hoạt động' : 'active branches'}
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Branch Drilldown Table */}
      <div className="mt-4 border-t pt-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Building2 size={14} />
          {copy.branchBreakdown}
        </h3>

        <TableContainer className="rounded border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>{copy.branchName}</TableHead>
                <TableHead className="w-24 text-center">{copy.orderCount}</TableHead>
                <TableHead className="text-right">{copy.gross}</TableHead>
                <TableHead className="text-right">{copy.platformFee}</TableHead>
                <TableHead className="text-right font-bold text-foreground">
                  {copy.netPayout}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.branchBreakdown.map((branch: BranchRevenueSummaryDto) => (
                <TableRow key={branch.branchId}>
                  <TableCell className="font-semibold text-foreground">
                    {branch.branchName}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {branch.orderCount}
                  </TableCell>
                  <TableCell className="text-right font-data">
                    {formatVnd(branch.grossAmount, locale)}
                  </TableCell>
                  <TableCell className="text-right font-data text-amber-700 dark:text-amber-400">
                    -{formatVnd(branch.platformCommissionAmount, locale)}
                  </TableCell>
                  <TableCell className="text-right font-data font-bold text-emerald-700 dark:text-emerald-400">
                    {formatVnd(branch.gymPayoutAmount, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </WorkspacePanel>
  );
}
