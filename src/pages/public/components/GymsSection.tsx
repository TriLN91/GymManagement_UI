import { Image as ImageIcon } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export function GymsSection() {
  return (
    <section className="container mx-auto px-4 py-24 bg-[#F3F6F2]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <h2 className="font-syne text-4xl md:text-5xl font-bold text-forest max-w-lg leading-tight">
          Hệ Thống Phòng Tập AI.
        </h2>
        <p className="font-sans text-forest/70 max-w-md font-medium">
          Liên kết với mạng lưới hệ thống các trung tâm fitness chuẩn quốc tế. Trang bị AI camera & thiết bị tập luyện chuyên dụng.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Gym Card 1 */}
        <div className="bg-white border border-forest/20 p-6 flex flex-col gap-6 group hover:border-forest transition-colors duration-300">
          <div className="bg-forest relative h-64 flex items-center justify-center overflow-hidden">
             {/* Map marker / location badge */}
             <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border border-white/20">
                <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                TP.HCM, Quận 1
             </div>
             
             {/* Placeholder for Gym Image */}
             <ImageIcon className="h-16 w-16 text-white/20" />
             
             <div className="absolute bottom-4 right-4 bg-mint text-forest px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               Premium Facility
             </div>
          </div>
          
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">Cơ sở 1 / FLAGSHIP</span>
              <span className="text-mint text-[10px] bg-forest px-2 py-1 rounded-full font-bold uppercase tracking-wider">Mở cửa 24/7</span>
            </div>
            <h3 className="font-syne text-2xl font-bold text-forest mb-3">District 01 Performance Lab.</h3>
            <p className="font-sans text-forest/70 font-medium text-sm">
              Tổ hợp phòng tập hiện đại nhất Quận 1. Trang bị đầy đủ máy móc Free Weight, Máy khối và Hệ thống AI phân tích của Hyer.
            </p>
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t border-forest/10 mt-auto">
            <div>
              <div className="text-[10px] text-forest/50 uppercase font-bold tracking-wider mb-1">Gói Hội Viên từ</div>
              <div className="font-syne text-xl font-bold text-forest">1.850.000đ <span className="text-sm font-sans font-normal text-forest/60">/ tháng</span></div>
            </div>
            <Button className="bg-forest text-white rounded-full font-bold px-6 hover:bg-forest/90">
              Đăng ký ngay &rarr;
            </Button>
          </div>
        </div>

        {/* Gym Card 2 */}
        <div className="bg-white border border-forest/20 p-6 flex flex-col gap-6 group hover:border-forest transition-colors duration-300">
          <div className="bg-forest relative h-64 flex items-center justify-center overflow-hidden">
             <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border border-white/20">
                <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                Hà Nội, Cầu Giấy
             </div>
             
             {/* Placeholder for Gym Image */}
             <ImageIcon className="h-16 w-16 text-white/20" />
             
             <div className="absolute bottom-4 right-4 bg-mint text-forest px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
               Hi-tech Studio
             </div>
          </div>
          
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">Cơ sở 2 / STUDIO</span>
              <span className="text-forest text-[10px] border border-forest px-2 py-1 rounded-full font-bold uppercase tracking-wider">Có PT hỗ trợ</span>
            </div>
            <h3 className="font-syne text-2xl font-bold text-forest mb-3">Biomechanic Fitness Hub.</h3>
            <p className="font-sans text-forest/70 font-medium text-sm">
              Phòng tập đặc biệt thiết kế riêng cho việc tối ưu biomechanics. Toàn bộ thiết bị được calibrate riêng với phần mềm AI của Hyer.
            </p>
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t border-forest/10 mt-auto">
            <div>
              <div className="text-[10px] text-forest/50 uppercase font-bold tracking-wider mb-1">Gói Hội Viên từ</div>
              <div className="font-syne text-xl font-bold text-forest">2.200.000đ <span className="text-sm font-sans font-normal text-forest/60">/ tháng</span></div>
            </div>
            <Button className="bg-forest text-white rounded-full font-bold px-6 hover:bg-forest/90">
              Đăng ký ngay &rarr;
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
