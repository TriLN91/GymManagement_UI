import { Image as ImageIcon } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export function GymsSection() {
  return (
    <section className="container mx-auto bg-[#F3F6F2] px-4 py-24">
      <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <h2 className="max-w-lg font-syne text-4xl font-bold leading-tight text-forest md:text-5xl">
          Hệ Thống Phòng Tập AI.
        </h2>
        <p className="max-w-md font-sans font-medium text-forest/70">
          Liên kết với mạng lưới hệ thống các trung tâm fitness chuẩn quốc tế. Trang bị AI camera &
          thiết bị tập luyện chuyên dụng.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gym Card 1 */}
        <div className="group flex flex-col gap-6 border border-forest/20 bg-white p-6 transition-colors duration-300 hover:border-forest">
          <div className="relative flex h-64 items-center justify-center overflow-hidden bg-forest">
            {/* Map marker / location badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
              TP.HCM, Quận 1
            </div>

            {/* Placeholder for Gym Image */}
            <ImageIcon className="h-16 w-16 text-white/20" />

            <div className="absolute bottom-4 right-4 rounded-full bg-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest">
              Premium Facility
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">
                Cơ sở 1 / FLAGSHIP
              </span>
              <span className="rounded-full bg-forest px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-mint">
                Mở cửa 24/7
              </span>
            </div>
            <h3 className="mb-3 font-syne text-2xl font-bold text-forest">
              District 01 Performance Lab.
            </h3>
            <p className="font-sans text-sm font-medium text-forest/70">
              Tổ hợp phòng tập hiện đại nhất Quận 1. Trang bị đầy đủ máy móc Free Weight, Máy khối
              và Hệ thống AI phân tích của Hyer.
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-forest/10 pt-6">
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-forest/50">
                Gói Hội Viên từ
              </div>
              <div className="font-syne text-xl font-bold text-forest">
                1.850.000đ{' '}
                <span className="font-sans text-sm font-normal text-forest/60">/ tháng</span>
              </div>
            </div>
            <Button className="rounded-full bg-forest px-6 font-bold text-white hover:bg-forest/90">
              Đăng ký ngay &rarr;
            </Button>
          </div>
        </div>

        {/* Gym Card 2 */}
        <div className="group flex flex-col gap-6 border border-forest/20 bg-white p-6 transition-colors duration-300 hover:border-forest">
          <div className="relative flex h-64 items-center justify-center overflow-hidden bg-forest">
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
              Hà Nội, Cầu Giấy
            </div>

            {/* Placeholder for Gym Image */}
            <ImageIcon className="h-16 w-16 text-white/20" />

            <div className="absolute bottom-4 right-4 rounded-full bg-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-forest">
              Hi-tech Studio
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-start justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">
                Cơ sở 2 / STUDIO
              </span>
              <span className="rounded-full border border-forest px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
                Có PT hỗ trợ
              </span>
            </div>
            <h3 className="mb-3 font-syne text-2xl font-bold text-forest">
              Biomechanic Fitness Hub.
            </h3>
            <p className="font-sans text-sm font-medium text-forest/70">
              Phòng tập đặc biệt thiết kế riêng cho việc tối ưu biomechanics. Toàn bộ thiết bị được
              calibrate riêng với phần mềm AI của Hyer.
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-forest/10 pt-6">
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-forest/50">
                Gói Hội Viên từ
              </div>
              <div className="font-syne text-xl font-bold text-forest">
                2.200.000đ{' '}
                <span className="font-sans text-sm font-normal text-forest/60">/ tháng</span>
              </div>
            </div>
            <Button className="rounded-full bg-forest px-6 font-bold text-white hover:bg-forest/90">
              Đăng ký ngay &rarr;
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
