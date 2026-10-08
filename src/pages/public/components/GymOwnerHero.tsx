import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function GymOwnerHero() {
  return (
    <section className="container mx-auto grid items-center gap-12 bg-[#F3F6F2] px-4 pb-24 pt-12 lg:grid-cols-2">
      <div className="flex flex-col items-start gap-6">
        <div className="inline-block rounded-full border border-forest/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-forest">
          GIẢI PHÁP VẬN HÀNH TOÀN DIỆN
        </div>

        <h1 className="font-syne text-[4rem] font-bold leading-[1] text-forest lg:text-[5rem]">
          FIT<span className="align-top text-3xl md:text-5xl">®</span> FOR
          <br />
          <span className="mt-4 block">OWNERS.</span>
        </h1>

        <p className="mt-4 max-w-md font-sans text-lg font-medium leading-relaxed text-forest/80">
          Tối ưu hóa quản trị phòng tập. Tích hợp AI để nâng cao trải nghiệm học viên, đánh giá hiệu
          suất PT và đưa ra dự đoán rời bỏ (churn prediction).
        </p>

        <div className="mt-6 flex items-center gap-4">
          <Button
            size="lg"
            className="h-12 rounded-full bg-forest px-8 font-bold text-white hover:bg-forest/90"
            asChild
          >
            <Link to={ROUTES.public.register}>Đăng ký dùng thử &rarr;</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-forest px-8 text-forest hover:bg-forest/5"
            asChild
          >
            <Link to={ROUTES.public.login}>Đăng nhập</Link>
          </Button>
        </div>
      </div>

      <div className="relative flex h-[500px] w-full flex-col overflow-hidden rounded-xl border border-forest/10 bg-white p-2 shadow-sm">
        <div className="flex gap-1.5 border-b border-forest/10 p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-mint"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-pebble/40"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-pebble/40"></div>
        </div>
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-forest/5">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-1 font-syne text-2xl font-bold text-forest">CRM & AI Dashboard</div>
            <div className="mb-8 text-sm font-bold uppercase tracking-widest text-forest/60">
              Business Operations
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-forest/10 bg-white p-4 text-left shadow-sm">
                <div className="mb-2 text-xs font-bold uppercase text-forest/50">
                  Tỉ lệ giữ chân
                </div>
                <div className="font-syne text-2xl font-bold text-mint">88%</div>
              </div>
              <div className="rounded-lg border border-forest/10 bg-white p-4 text-left shadow-sm">
                <div className="mb-2 text-xs font-bold uppercase text-forest/50">Doanh thu AI</div>
                <div className="font-syne text-2xl font-bold text-forest">+24%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
