import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center bg-[#F3F6F2]">
      <div className="flex flex-col gap-6 items-start">
        <div className="inline-block border border-forest/20 rounded-full px-4 py-1.5 text-xs font-bold text-forest uppercase tracking-wider">
          AI POWERED & PRECISION FORM
        </div>
        
        <h1 className="font-syne text-[5rem] lg:text-[7rem] font-bold text-forest leading-[1]">
          FIT<span className="align-top text-3xl md:text-5xl">®</span>
          <br />
          <span className="block mt-4">Vượt Trội.</span>
          <span className="block">AI.</span>
        </h1>
        
        <p className="font-sans text-forest/80 text-lg max-w-md font-medium leading-relaxed mt-4">
          Phân tích chuyển động chính xác từng milimet. Đột phá từ phòng gym đến thi đấu chuyên nghiệp với mô hình tracking thời gian thực. Cơ sở dữ liệu 10,000+ chuyển động thể hình.
        </p>
        
        <div className="flex items-center gap-4 mt-6">
          <Button size="lg" className="bg-mint text-forest hover:bg-mint/90 rounded-full font-bold px-8 h-12" asChild>
            <Link to={ROUTES.public.register}>Bắt đầu tập luyện &rarr;</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-forest text-forest hover:bg-forest/5 rounded-full px-8 h-12" asChild>
            <Link to="#ai-features">Khám phá AI</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-forest/10 w-full max-w-lg">
          <div>
            <div className="font-syne text-2xl font-bold text-forest">88.7%</div>
            <div className="text-[10px] text-forest/70 mt-1 uppercase font-bold tracking-wider">Độ chính xác</div>
          </div>
          <div>
            <div className="font-syne text-2xl font-bold text-forest">&lt;16ms</div>
            <div className="text-[10px] text-forest/70 mt-1 uppercase font-bold tracking-wider">Độ trễ xử lý</div>
          </div>
          <div>
            <div className="font-syne text-2xl font-bold text-forest">32+ Điểm</div>
            <div className="text-[10px] text-forest/70 mt-1 uppercase font-bold tracking-wider">Tracking khớp xương</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-forest/10 p-2 shadow-sm relative h-[600px] flex flex-col w-full">
        <div className="flex gap-1.5 p-3 border-b border-forest/10">
          <div className="w-2.5 h-2.5 rounded-full bg-mint"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-pebble/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-pebble/40"></div>
        </div>
        <div className="flex-1 bg-[#E8E6FC] flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-4 border border-forest/20 border-dashed"></div>
           <div className="relative text-center z-10 flex flex-col items-center">
             <div className="w-32 h-32 border-2 border-mint rounded-lg flex items-center justify-center mb-4 relative bg-white">
                <div className="absolute top-0 left-0 w-2 h-2 bg-mint -translate-x-1/2 -translate-y-1/2 rounded-full" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-mint translate-x-1/2 -translate-y-1/2 rounded-full" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-mint -translate-x-1/2 translate-y-1/2 rounded-full" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-mint translate-x-1/2 translate-y-1/2 rounded-full" />
                <span className="font-syne font-bold text-forest text-3xl">AI</span>
             </div>
             <div className="font-syne text-xl text-forest font-bold mb-1">AI Tracking Active</div>
             <div className="text-xs text-forest/60 uppercase tracking-widest font-bold">3D Pose Estimation Model</div>
           </div>
           
           <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 flex justify-between items-center text-xs border border-forest/10">
              <span className="font-bold text-forest uppercase tracking-wider">Squat Depth Detection</span>
              <span className="bg-mint text-forest px-3 py-1.5 rounded-full font-bold">100% - PERFECT</span>
           </div>
        </div>
      </div>
    </section>
  );
}
