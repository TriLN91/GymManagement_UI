import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function HeroSection() {
  return (
    <section className="container mx-auto grid items-center gap-12 bg-[#F3F6F2] px-4 pb-24 pt-12 lg:grid-cols-2">
      <div className="flex flex-col items-start gap-6">
        <div className="inline-block rounded-full border border-forest/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-forest">
          AI POWERED & PRECISION FORM
        </div>

        <h1 className="font-syne text-[5rem] font-bold leading-[1] text-forest lg:text-[7rem]">
          FIT<span className="align-top text-3xl md:text-5xl">®</span>
          <br />
          <span className="mt-4 block">Vượt Trội.</span>
          <span className="block">AI.</span>
        </h1>

        <p className="mt-4 max-w-md font-sans text-lg font-medium leading-relaxed text-forest/80">
          Phân tích chuyển động chính xác từng milimet. Đột phá từ phòng gym đến thi đấu chuyên
          nghiệp với mô hình tracking thời gian thực. Cơ sở dữ liệu 10,000+ chuyển động thể hình.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <Button
            size="lg"
            className="hover:bg-mint/90 h-12 rounded-full bg-mint px-8 font-bold text-forest"
            asChild
          >
            <Link to={ROUTES.public.register}>Bắt đầu tập luyện &rarr;</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-forest px-8 text-forest hover:bg-forest/5"
            asChild
          >
            <Link to="#ai-features">Khám phá AI</Link>
          </Button>
        </div>

        <div className="mt-12 grid w-full max-w-lg grid-cols-3 gap-8 border-t border-forest/10 pt-8">
          <div>
            <div className="font-syne text-2xl font-bold text-forest">88.7%</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-forest/70">
              Độ chính xác
            </div>
          </div>
          <div>
            <div className="font-syne text-2xl font-bold text-forest">&lt;16ms</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-forest/70">
              Độ trễ xử lý
            </div>
          </div>
          <div>
            <div className="font-syne text-2xl font-bold text-forest">32+ Điểm</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-forest/70">
              Tracking khớp xương
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex h-[600px] w-full flex-col border border-forest/10 bg-white p-2 shadow-sm">
        <div className="flex gap-1.5 border-b border-forest/10 p-3">
          <div className="h-2.5 w-2.5 rounded-full bg-mint"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-pebble/40"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-pebble/40"></div>
        </div>
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#E8E6FC]">
          <div className="absolute inset-4 border border-dashed border-forest/20"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-mint bg-white">
              <div className="absolute left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint" />
              <div className="absolute right-0 top-0 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-mint" />
              <div className="absolute bottom-0 left-0 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-mint" />
              <div className="absolute bottom-0 right-0 h-2 w-2 translate-x-1/2 translate-y-1/2 rounded-full bg-mint" />
              <span className="font-syne text-3xl font-bold text-forest">AI</span>
            </div>
            <div className="mb-1 font-syne text-xl font-bold text-forest">AI Tracking Active</div>
            <div className="text-xs font-bold uppercase tracking-widest text-forest/60">
              3D Pose Estimation Model
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between border border-forest/10 bg-white/90 p-4 text-xs backdrop-blur-md">
            <span className="font-bold uppercase tracking-wider text-forest">
              Squat Depth Detection
            </span>
            <span className="rounded-full bg-mint px-3 py-1.5 font-bold text-forest">
              100% - PERFECT
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
