import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function GymOwnerHero() {
  return (
    <section className="container mx-auto px-4 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center bg-[#F3F6F2]">
      <div className="flex flex-col gap-6 items-start">
        <div className="inline-block border border-forest/20 rounded-full px-4 py-1.5 text-xs font-bold text-forest uppercase tracking-wider">
          GIẢI PHÁP VẬN HÀNH TOÀN DIỆN
        </div>
        
        <h1 className="font-syne text-[4rem] lg:text-[5rem] font-bold text-forest leading-[1]">
          FIT<span className="align-top text-3xl md:text-5xl">®</span> FOR
          <br />
          <span className="block mt-4">OWNERS.</span>
        </h1>
        
        <p className="font-sans text-forest/80 text-lg max-w-md font-medium leading-relaxed mt-4">
          Tối ưu hóa quản trị phòng tập. Tích hợp AI để nâng cao trải nghiệm học viên, đánh giá hiệu suất PT và đưa ra dự đoán rời bỏ (churn prediction).
        </p>
        
        <div className="flex items-center gap-4 mt-6">
          <Button size="lg" className="bg-forest text-white hover:bg-forest/90 rounded-full font-bold px-8 h-12" asChild>
            <Link to={ROUTES.public.register}>Đăng ký dùng thử &rarr;</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-forest text-forest hover:bg-forest/5 rounded-full px-8 h-12" asChild>
            <Link to={ROUTES.public.login}>Đăng nhập</Link>
          </Button>
        </div>
        
      </div>
      
      <div className="bg-white border border-forest/10 p-2 shadow-sm relative h-[500px] flex flex-col w-full rounded-xl overflow-hidden">
        <div className="flex gap-1.5 p-3 border-b border-forest/10">
          <div className="w-2.5 h-2.5 rounded-full bg-mint"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-pebble/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-pebble/40"></div>
        </div>
        <div className="flex-1 bg-forest/5 flex items-center justify-center relative overflow-hidden">
           <div className="relative text-center z-10 flex flex-col items-center">
             <div className="font-syne text-2xl text-forest font-bold mb-1">CRM & AI Dashboard</div>
             <div className="text-sm text-forest/60 uppercase tracking-widest font-bold mb-8">Business Operations</div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 border border-forest/10 rounded-lg text-left shadow-sm">
                   <div className="text-xs text-forest/50 font-bold uppercase mb-2">Tỉ lệ giữ chân</div>
                   <div className="text-2xl font-syne font-bold text-mint">88%</div>
                </div>
                <div className="bg-white p-4 border border-forest/10 rounded-lg text-left shadow-sm">
                   <div className="text-xs text-forest/50 font-bold uppercase mb-2">Doanh thu AI</div>
                   <div className="text-2xl font-syne font-bold text-forest">+24%</div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
