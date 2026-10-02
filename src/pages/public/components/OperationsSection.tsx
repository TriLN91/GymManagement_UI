import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function OperationsSection() {
  return (
    <section className="bg-forest text-white py-24">
      <div className="container mx-auto px-4">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16">
          <div className="max-w-xl">
            <div className="inline-block border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider mb-6">
              QUẢN LÝ CHO CHỦ PHÒNG TẬP (B2B)
            </div>
            <h2 className="font-syne text-5xl md:text-7xl font-bold text-white leading-[1] mb-6">
              Quản Lý<br />Vận Hành.
            </h2>
            <p className="font-sans text-white/80 font-medium text-lg leading-relaxed">
              Quản lý phòng tập, vận hành Trainer, phân tích hiệu suất học viên tất cả bằng AI. 
              Giảm thiểu 40% chi phí vận hành, kiểm soát tỉ lệ retention hội viên bằng dữ liệu báo cáo từ Churn Prediction Model 30 ngày.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shrink-0 w-full lg:w-96">
             <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3 mb-4">
               <span>Dành cho Quản trị viên</span>
               <span className="text-mint">Admin Login &rarr;</span>
             </div>
             <div className="flex justify-between items-center mb-6">
               <span className="font-syne font-bold text-lg">Tỷ lệ Retention hội viên</span>
               <span className="text-mint font-syne font-bold text-xl">88.5%</span>
             </div>
             <Button className="w-full bg-mint text-forest hover:bg-mint/90 rounded-full font-bold h-12" asChild>
               <Link to={ROUTES.public.login}>Đăng nhập dành cho Gym Owner</Link>
             </Button>
          </div>
        </div>

        {/* Dashboard Preview Cards */}
        <div className="grid md:grid-cols-12 gap-6 mb-6">
          <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors">
             <div className="flex justify-between items-start mb-12">
               <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Thống Kê Doanh Thu</span>
               <span className="bg-mint text-forest text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">THÁNG NÀY</span>
             </div>
             <div>
               <div className="font-syne text-4xl md:text-5xl font-bold text-mint mb-2">145,000,000</div>
               <div className="text-sm font-bold uppercase tracking-wider text-white mb-6">VNĐ</div>
               <div className="flex justify-between items-center text-xs font-medium text-white/70 border-t border-white/10 pt-4">
                 <span>Tỷ lệ tăng trưởng so với tháng trước</span>
                 <span className="text-mint">+12.5%</span>
               </div>
             </div>
          </div>
          
          <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors">
             <div className="flex justify-between items-start mb-6">
               <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Hệ Thống Phân Bổ</span>
               <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">3 CHI NHÁNH</span>
             </div>
             <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <div>
                   <div className="font-bold text-white mb-1">Cơ sở Quận 1</div>
                   <div className="text-xs text-white/50">District 01 Performance Lab</div>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-white mb-1">450</div>
                   <div className="text-xs text-white/50 uppercase">Hội viên</div>
                 </div>
               </div>
               <div className="flex justify-between items-center border-b border-white/10 pb-2">
                 <div>
                   <div className="font-bold text-white mb-1">Cơ sở Cầu Giấy</div>
                   <div className="text-xs text-white/50">Biomechanic Fitness Hub</div>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-white mb-1">215</div>
                   <div className="text-xs text-white/50 uppercase">Hội viên</div>
                 </div>
               </div>
               <div className="flex justify-between items-center">
                 <div>
                   <div className="font-bold text-white mb-1">Cơ sở Đà Nẵng</div>
                   <div className="text-xs text-white/50">Hyer Studio - Chờ khai trương</div>
                 </div>
                 <div className="text-right">
                   <div className="font-bold text-white mb-1">--</div>
                   <div className="text-xs text-white/50 uppercase">Hội viên</div>
                 </div>
               </div>
             </div>
          </div>
          
          <div className="md:col-span-4 bg-white p-6 flex flex-col justify-between text-forest">
             <div className="flex justify-between items-start mb-6">
               <span className="bg-forest text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">AI PACKAGES</span>
             </div>
             <div>
               <h3 className="font-syne text-3xl font-bold mb-4">AI Plus Bundles.</h3>
               <p className="text-sm font-medium mb-6 leading-relaxed">
                 Gói nâng cấp cho Gym Owner để tích hợp 100% giải pháp AI vào hệ thống:
               </p>
               <ul className="text-sm font-medium space-y-3 mb-8">
                 <li className="flex gap-2"><span className="text-forest">&bull;</span> Cung cấp app riêng biệt logo brand của bạn</li>
                 <li className="flex gap-2"><span className="text-forest">&bull;</span> API kết nối với hệ thống CRM/ERP hiện tại</li>
                 <li className="flex gap-2"><span className="text-forest">&bull;</span> Tặng thiết bị camera AI chuẩn y tế cho khu vực Free Weight</li>
               </ul>
             </div>
             <Button className="w-full bg-forest text-white hover:bg-forest/90 rounded-full font-bold">
               Liên hệ tư vấn
             </Button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-white/5 border border-white/10 p-8 flex flex-col md:flex-row justify-between items-center gap-8 mt-12">
           <div>
             <div className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">GIẢI PHÁP TOÀN DIỆN CHO GYM OWNER</div>
             <h3 className="font-syne text-3xl md:text-4xl font-bold text-white mb-4">Phòng tập của bạn.<br/>Hệ sinh thái của bạn.</h3>
             <p className="text-white/70 font-medium max-w-lg">
               Thay đổi cách bạn tương tác với Hội viên và PT. Thúc đẩy doanh thu và giảm thiểu rủi ro vận hành bằng công nghệ AI 3D Vision ưu việt.
             </p>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8 h-12 font-bold whitespace-nowrap bg-transparent">
               Đăng ký dùng thử
             </Button>
             <Button className="bg-mint text-forest hover:bg-mint/90 rounded-full px-8 h-12 font-bold whitespace-nowrap" asChild>
               <Link to={ROUTES.public.register}>Liên hệ tư vấn &rarr;</Link>
             </Button>
           </div>
        </div>
      </div>
    </section>
  );
}
