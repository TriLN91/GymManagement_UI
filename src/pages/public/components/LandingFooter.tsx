import { Link } from 'react-router-dom';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-forest py-16 text-white">
      <div className="container mx-auto grid gap-12 px-4 md:grid-cols-12">
        <div className="flex flex-col gap-6 md:col-span-4">
          <div className="flex flex-col gap-2">
            <span className="flex items-center font-syne text-3xl font-bold text-white">
              FIT<span className="relative -top-2 align-top text-xs">®</span>
            </span>
            <span className="font-syne text-xl font-bold tracking-tight text-mint">
              our legacy start here.
            </span>
          </div>
          <p className="max-w-sm text-sm font-medium text-white/60">
            Hệ thống AI thể hình toàn diện nhất thế giới. Phát triển để tối ưu hóa hiệu suất từ
            người mới bắt đầu đến vận động viên chuyên nghiệp.
          </p>
          <div className="mt-8 text-[10px] text-white/40">
            Hyer Solutions - Core Tech by HyerTeam
          </div>
        </div>

        <div className="flex flex-col gap-4 md:col-span-3">
          <h4 className="font-syne text-lg font-bold text-white">Khám phá tính năng</h4>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            AI Video Analysis
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Adaptive Planning
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Workout Tracking
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Gym Management
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Admin Console
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:col-span-3">
          <h4 className="font-syne text-lg font-bold text-white">Khách hàng & Đối tác</h4>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Dành cho Hội viên (Member)
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Dành cho Chủ phòng (Gym Owner)
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Trở thành PT Đối tác (Coach)
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Chính sách Bán hàng & Phân phối
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Tài liệu API API Reference
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:col-span-2">
          <h4 className="font-syne text-lg font-bold text-white">Liên hệ & Hỗ trợ</h4>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Contact Us
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Điều khoản & Chính sách bảo mật
          </Link>
          <Link
            to="#"
            className="text-sm font-medium text-white/70 transition-colors hover:text-mint"
          >
            Trung tâm Trợ giúp 24/7
          </Link>
        </div>
      </div>
    </footer>
  );
}
