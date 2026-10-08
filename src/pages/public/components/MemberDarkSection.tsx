import { Activity, Flame, Goal } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export function MemberDarkSection() {
  return (
    <section className="bg-forest py-24 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <div className="mb-6 inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              MEMBER INSIGHTS
            </div>
            <h2 className="mb-6 font-syne text-5xl font-bold leading-[1] text-white md:text-7xl">
              Tiến Bộ
              <br />
              Không
              <br />
              Ngẫu Nhiên.
            </h2>
            <p className="font-sans text-lg font-medium leading-relaxed text-white/80">
              Trải nghiệm mọi dữ liệu tập luyện của bạn được số hoá đồng bộ. Trí tuệ nhân tạo FIT
              phân tích, đánh giá, và đưa ra con số chính xác về nỗ lực bạn bỏ ra.
            </p>
          </div>

          <div className="w-full shrink-0 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:w-96">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 text-xs font-bold uppercase tracking-wider text-white/60">
              <span>Jonathan Phamh</span>
              <span className="bg-mint/20 rounded-full px-2 py-1 text-mint">PRO</span>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-mint/20 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold text-mint">
                JP
              </div>
              <div>
                <div className="font-syne text-lg font-bold text-white">Khách Hàng Vip</div>
                <div className="text-sm text-white/60">Gia nhập: 12/2023</div>
              </div>
            </div>
            <Button className="hover:bg-mint/90 h-12 w-full rounded-full bg-mint font-bold text-forest">
              Xem Hồ Sơ Thành Viên &rarr;
            </Button>
          </div>
        </div>

        {/* Dashboard Preview Cards */}
        <div className="mb-6 grid gap-6 md:grid-cols-12">
          <div className="flex flex-col justify-between border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 md:col-span-4">
            <div className="mb-12 flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                Lượng Calo Tiêu Thụ
              </span>
              <Flame className="h-4 w-4 text-mint" />
            </div>
            <div>
              <div className="mb-2 font-syne text-4xl font-bold text-mint md:text-5xl">10,450</div>
              <div className="mb-6 text-sm font-bold uppercase tracking-wider text-white">KCAL</div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-medium text-white/70">
                <span>Tuần này</span>
                <span className="text-mint">+12%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 md:col-span-4">
            <div className="mb-12 flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                Mức Độ Hoàn Thành
              </span>
              <Goal className="h-4 w-4 text-mint" />
            </div>
            <div>
              <div className="mb-2 font-syne text-4xl font-bold text-white md:text-5xl">88.4%</div>
              <div className="mb-6 text-sm font-bold uppercase tracking-wider text-white/50">
                TỈ LỆ
              </div>
              <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[88.4%] rounded-full bg-mint"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10 md:col-span-4">
            <div className="mb-12 flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                Khối Lượng Cơ Thể
              </span>
              <Activity className="h-4 w-4 text-mint" />
            </div>
            <div>
              <div className="mb-2 font-syne text-4xl font-bold text-white md:text-5xl">17.5</div>
              <div className="mb-6 text-sm font-bold uppercase tracking-wider text-white/50">
                BMI / CHUẨN
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-medium text-white/70">
                <span>Mục tiêu</span>
                <span className="text-white">Giữ dáng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
