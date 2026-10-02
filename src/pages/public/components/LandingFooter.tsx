import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="bg-forest text-white py-16 border-t border-white/10">
      <div className="container mx-auto px-4 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-syne text-3xl font-bold text-white flex items-center">
              FIT<span className="text-xs align-top relative -top-2">®</span>
            </span>
            <span className="font-syne font-bold text-mint text-xl tracking-tight">our legacy start here.</span>
          </div>
          <p className="text-sm text-white/60 font-medium max-w-sm">
            Hệ thống AI thể hình toàn diện nhất thế giới. Phát triển để tối ưu hóa hiệu suất từ người mới bắt đầu đến vận động viên chuyên nghiệp.
          </p>
          <div className="text-[10px] text-white/40 mt-8">
            Hyer Solutions - Core Tech by HyerTeam
          </div>
        </div>
        
        <div className="md:col-span-3 flex flex-col gap-4">
          <h4 className="font-syne font-bold text-white text-lg">Khám phá tính năng</h4>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">AI Video Analysis</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Adaptive Planning</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Workout Tracking</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Gym Management</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Admin Console</Link>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <h4 className="font-syne font-bold text-white text-lg">Khách hàng & Đối tác</h4>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Dành cho Hội viên (Member)</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Dành cho Chủ phòng (Gym Owner)</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Trở thành PT Đối tác (Coach)</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Chính sách Bán hàng & Phân phối</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Tài liệu API API Reference</Link>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="font-syne font-bold text-white text-lg">Liên hệ & Hỗ trợ</h4>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Contact Us</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Điều khoản & Chính sách bảo mật</Link>
          <Link to="#" className="text-sm font-medium text-white/70 hover:text-mint transition-colors">Trung tâm Trợ giúp 24/7</Link>
        </div>
      </div>
    </footer>
  );
}
