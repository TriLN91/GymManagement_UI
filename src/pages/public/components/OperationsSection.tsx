import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function OperationsSection() {
  return (
    <section className="bg-forest py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <div className="mb-6 inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              QUẢN LÝ CHO CHỦ PHÒNG TẬP (B2B)
            </div>
            <h2 className="mb-6 font-syne text-5xl font-bold leading-[1] text-white md:text-7xl">
              Quản Lý
              <br />
              Vận Hành.
            </h2>
            <p className="font-sans text-lg font-medium leading-relaxed text-white/80">
              Quản lý phòng tập, vận hành Trainer, phân tích hiệu suất học viên tất cả bằng AI. Giảm
              thiểu 40% chi phí vận hành, kiểm soát tỉ lệ retention hội viên bằng dữ liệu báo cáo từ
              Churn Prediction Model 30 ngày.
            </p>
          </div>

          <div className="w-full shrink-0 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:w-96">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-wider text-white/60">
              <span>Dành cho Quản trị viên</span>
              <span className="text-mint">Admin Login &rarr;</span>
            </div>
            <div className="mb-6 flex items-center justify-between">
              <span className="font-syne text-lg font-bold">Tỷ lệ Retention hội viên</span>
              <span className="font-syne text-xl font-bold text-mint">88.5%</span>
            </div>
            <Button
              className="hover:bg-mint/90 h-12 w-full rounded-full bg-mint font-bold text-forest"
              asChild
            >
              <Link to={ROUTES.public.login}>Đăng nhập dành cho Gym Owner</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Preview Cards */}
        <div className="mb-6 grid gap-6 md:grid-cols-12">
          <div className="flex flex-col justify-between border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 md:col-span-4">
            <div className="mb-12 flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                Thống Kê Doanh Thu
              </span>
              <span className="rounded-full bg-mint px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
                THÁNG NÀY
              </span>
            </div>
            <div>
              <div className="mb-2 font-syne text-4xl font-bold text-mint md:text-5xl">
                145,000,000
              </div>
              <div className="mb-6 text-sm font-bold uppercase tracking-wider text-white">VNĐ</div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-medium text-white/70">
                <span>Tỷ lệ tăng trưởng so với tháng trước</span>
                <span className="text-mint">+12.5%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 md:col-span-4">
            <div className="mb-6 flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                Hệ Thống Phân Bổ
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                3 CHI NHÁNH
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="mb-1 font-bold text-white">Cơ sở Quận 1</div>
                  <div className="text-xs text-white/50">District 01 Performance Lab</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 font-bold text-white">450</div>
                  <div className="text-xs uppercase text-white/50">Hội viên</div>
                </div>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="mb-1 font-bold text-white">Cơ sở Cầu Giấy</div>
                  <div className="text-xs text-white/50">Biomechanic Fitness Hub</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 font-bold text-white">215</div>
                  <div className="text-xs uppercase text-white/50">Hội viên</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1 font-bold text-white">Cơ sở Đà Nẵng</div>
                  <div className="text-xs text-white/50">Hyer Studio - Chờ khai trương</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 font-bold text-white">--</div>
                  <div className="text-xs uppercase text-white/50">Hội viên</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-white p-6 text-forest md:col-span-4">
            <div className="mb-6 flex items-start justify-between">
              <span className="rounded-full bg-forest px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                AI PACKAGES
              </span>
            </div>
            <div>
              <h3 className="mb-4 font-syne text-3xl font-bold">AI Plus Bundles.</h3>
              <p className="mb-6 text-sm font-medium leading-relaxed">
                Gói nâng cấp cho Gym Owner để tích hợp 100% giải pháp AI vào hệ thống:
              </p>
              <ul className="mb-8 space-y-3 text-sm font-medium">
                <li className="flex gap-2">
                  <span className="text-forest">&bull;</span> Cung cấp app riêng biệt logo brand của
                  bạn
                </li>
                <li className="flex gap-2">
                  <span className="text-forest">&bull;</span> API kết nối với hệ thống CRM/ERP hiện
                  tại
                </li>
                <li className="flex gap-2">
                  <span className="text-forest">&bull;</span> Tặng thiết bị camera AI chuẩn y tế cho
                  khu vực Free Weight
                </li>
              </ul>
            </div>
            <Button className="w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90">
              Liên hệ tư vấn
            </Button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 flex flex-col items-center justify-between gap-8 border border-white/10 bg-white/5 p-8 md:flex-row">
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/50">
              GIẢI PHÁP TOÀN DIỆN CHO GYM OWNER
            </div>
            <h3 className="mb-4 font-syne text-3xl font-bold text-white md:text-4xl">
              Phòng tập của bạn.
              <br />
              Hệ sinh thái của bạn.
            </h3>
            <p className="max-w-lg font-medium text-white/70">
              Thay đổi cách bạn tương tác với Hội viên và PT. Thúc đẩy doanh thu và giảm thiểu rủi
              ro vận hành bằng công nghệ AI 3D Vision ưu việt.
            </p>
          </div>
          <div className="flex w-full flex-col gap-4 sm:flex-row md:w-auto">
            <Button
              variant="outline"
              className="h-12 whitespace-nowrap rounded-full border-white bg-transparent px-8 font-bold text-white hover:bg-white/10"
            >
              Đăng ký dùng thử
            </Button>
            <Button
              className="hover:bg-mint/90 h-12 whitespace-nowrap rounded-full bg-mint px-8 font-bold text-forest"
              asChild
            >
              <Link to={ROUTES.public.register}>Liên hệ tư vấn &rarr;</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
