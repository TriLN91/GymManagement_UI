import { Activity, Flame, Goal } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export function MemberDarkSection() {
  return (
    <section className="bg-forest text-white py-24">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16">
          <div className="max-w-xl">
            <div className="inline-block border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider mb-6">
              MEMBER INSIGHTS
            </div>
            <h2 className="font-syne text-5xl md:text-7xl font-bold text-white leading-[1] mb-6">
              Tiến Bộ<br />Không<br />Ngẫu Nhiên.
            </h2>
            <p className="font-sans text-white/80 font-medium text-lg leading-relaxed">
              Trải nghiệm mọi dữ liệu tập luyện của bạn được số hoá đồng bộ. Trí tuệ nhân tạo FIT phân tích, đánh giá, và đưa ra con số chính xác về nỗ lực bạn bỏ ra.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shrink-0 w-full lg:w-96">
             <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3 mb-4">
               <span>Jonathan Phamh</span>
               <span className="bg-mint/20 text-mint px-2 py-1 rounded-full">PRO</span>
             </div>
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-mint/20 rounded-full flex items-center justify-center text-mint font-bold text-xl">
                  JP
                </div>
                <div>
                   <div className="font-syne font-bold text-lg text-white">Khách Hàng Vip</div>
                   <div className="text-sm text-white/60">Gia nhập: 12/2023</div>
                </div>
             </div>
             <Button className="w-full bg-mint text-forest hover:bg-mint/90 rounded-full font-bold h-12">
               Xem Hồ Sơ Thành Viên &rarr;
             </Button>
          </div>
        </div>

        {/* Dashboard Preview Cards */}
        <div className="grid md:grid-cols-12 gap-6 mb-6">
          <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors">
             <div className="flex justify-between items-start mb-12">
               <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Lượng Calo Tiêu Thụ</span>
               <Flame className="h-4 w-4 text-mint" />
             </div>
             <div>
               <div className="font-syne text-4xl md:text-5xl font-bold text-mint mb-2">10,450</div>
               <div className="text-sm font-bold uppercase tracking-wider text-white mb-6">KCAL</div>
               <div className="flex justify-between items-center text-xs font-medium text-white/70 border-t border-white/10 pt-4">
                 <span>Tuần này</span>
                 <span className="text-mint">+12%</span>
               </div>
             </div>
          </div>
          
          <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors">
             <div className="flex justify-between items-start mb-12">
               <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Mức Độ Hoàn Thành</span>
               <Goal className="h-4 w-4 text-mint" />
             </div>
             <div>
               <div className="font-syne text-4xl md:text-5xl font-bold text-white mb-2">88.4%</div>
               <div className="text-sm font-bold uppercase tracking-wider text-white/50 mb-6">TỈ LỆ</div>
               <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-6">
                 <div className="h-full bg-mint w-[88.4%] rounded-full"></div>
               </div>
             </div>
          </div>
          
          <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors">
             <div className="flex justify-between items-start mb-12">
               <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Khối Lượng Cơ Thể</span>
               <Activity className="h-4 w-4 text-mint" />
             </div>
             <div>
               <div className="font-syne text-4xl md:text-5xl font-bold text-white mb-2">17.5</div>
               <div className="text-sm font-bold uppercase tracking-wider text-white/50 mb-6">BMI / CHUẨN</div>
               <div className="flex justify-between items-center text-xs font-medium text-white/70 border-t border-white/10 pt-4">
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
