import { Activity, Camera, Map, Play } from 'lucide-react';

import { Button } from '@/shared/ui/button';

export function MemberDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="grid items-start gap-6 lg:grid-cols-3">
        {/* Left: Active Routine */}
        <div className="relative overflow-hidden rounded-xl border border-forest/20 bg-[var(--energy-lime-soft)] p-6 lg:col-span-2">
          {/* Subtle bg glow */}
          <div className="bg-mint/5 pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full blur-3xl"></div>

          <div className="mb-6 flex items-center gap-2">
            <Map className="h-4 w-4 text-forest/40" />
            <div className="rounded-sm border border-forest/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-forest/60">
              AI PLAN GENERATED // 12 WEEKS HYPERTROPHY
            </div>
            <div className="rounded-sm bg-energy px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-forest">
              Giai đoạn: HYPERTROPHY CYCLE T1
            </div>
          </div>

          <h2 className="mb-4 font-syne text-2xl font-bold text-forest">
            Upper Body Hypertrophy & Lat Stability
          </h2>

          <div className="mb-8 flex items-end gap-6">
            <div>
              <span className="font-syne text-4xl font-bold text-forest">04</span>
              <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                BÀI TẬP
              </span>
            </div>
            <div className="text-3xl font-light text-forest/20">/</div>
            <div>
              <span className="font-syne text-4xl font-bold text-forest">50</span>
              <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                PHÚT DỰ KIẾN
              </span>
            </div>
            <div className="text-3xl font-light text-forest/20">/</div>
            <div>
              <span className="font-syne text-4xl font-bold text-forest">60.0</span>
              <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                KCAL DỰ KIẾN
              </span>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex aspect-square flex-col justify-between rounded-lg border border-forest/10 bg-energy p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/60">
                Target: Chest & Triceps
              </div>
              <div className="mb-4 font-syne text-lg font-bold leading-tight text-forest">
                Barbell Bench Press
              </div>
              <div className="mt-auto flex justify-between border-t border-forest/10 pt-2 text-xs font-bold text-forest">
                <span>4 SETS</span>
                <span>8-10 REPS</span>
              </div>
            </div>
            <div className="flex aspect-square flex-col justify-between rounded-lg border border-forest/10 bg-energy p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/60">
                Target: Lats & Biceps
              </div>
              <div className="mb-4 font-syne text-lg font-bold leading-tight text-forest">
                Lat Pulldown Wide Grip
              </div>
              <div className="mt-auto flex justify-between border-t border-forest/10 pt-2 text-xs font-bold text-forest">
                <span>3 SETS</span>
                <span>10-12 REPS</span>
              </div>
            </div>
            <div className="flex aspect-square flex-col justify-between rounded-lg border border-forest/10 bg-energy p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/60">
                Target: Core & Grip
              </div>
              <div className="mb-4 font-syne text-lg font-bold leading-tight text-forest">
                Dead Hang Isometric
              </div>
              <div className="mt-auto flex justify-between border-t border-forest/10 pt-2 text-xs font-bold text-forest">
                <span>3 SETS</span>
                <span>45 SECS</span>
              </div>
            </div>
            <div className="flex aspect-square flex-col justify-between rounded-lg border border-forest/10 bg-energy p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/60">
                Target: Cardio & Back
              </div>
              <div className="mb-4 font-syne text-lg font-bold leading-tight text-forest">
                Ergometer Row Sprint
              </div>
              <div className="mt-auto flex justify-between border-t border-forest/10 pt-2 text-xs font-bold text-forest">
                <span>INTERVALS</span>
                <span>HIT</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-forest/70">
              <Activity className="h-4 w-4 text-mint" />
              Độ khó khởi động dự kiến dựa trên RPE phiên gần nhất:{' '}
              <span className="font-bold text-forest">7.5</span>
            </div>
            <Button className="h-10 gap-2 rounded-full bg-forest px-6 font-bold text-white hover:bg-forest/90">
              Bắt đầu buổi tập <Play className="h-3 w-3 fill-white" />
            </Button>
          </div>
        </div>

        {/* Right: Setup Progress */}
        <div className="relative flex h-full flex-col rounded-xl border border-forest/20 bg-white p-6 lg:col-span-1">
          <div className="mb-6 flex items-start justify-between">
            <h3 className="font-syne text-xl font-bold leading-none text-forest">
              THIẾT LẬP HỒ SƠ
            </h3>
            <div className="bg-mint/20 rounded-sm px-2 py-1 text-right text-[10px] font-bold uppercase tracking-widest text-forest">
              Tiến độ: 2 / 4 <br />
              hoàn tất
            </div>
          </div>

          <p className="mb-8 text-sm font-medium leading-relaxed text-forest/70">
            Cập nhật đầy đủ tham số thể trạng để thuật toán AI-Pose tính toán rủi ro trong chuẩn
            xác.
          </p>

          <div className="flex flex-1 flex-col gap-6">
            <div className="flex items-center justify-between border-b border-forest/10 pb-4">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                  MỤC TIÊU HUẤN LUYỆN
                </div>
                <div className="text-sm font-bold text-forest">Tăng cơ & Tối đa mức cơ thể</div>
              </div>
              <div className="rounded-full border border-forest/20 bg-energy px-2 py-1 text-[9px] font-bold uppercase text-forest">
                Đã hoàn thành
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-forest/10 pb-4">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                  CHỈ SỐ CƠ THỂ
                </div>
                <div className="text-sm font-bold text-forest">58.0 kg (Target: 62.0 kg)</div>
              </div>
              <div className="rounded-full border border-forest/20 bg-energy px-2 py-1 text-[9px] font-bold uppercase text-forest">
                Đã hoàn thành
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-forest/10 pb-4">
              <div>
                <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                  LỊCH SỬ CHẤN THƯƠNG / Y TẾ
                </div>
                <div className="text-sm font-bold text-red-500">Chưa cập nhật</div>
              </div>
              <div className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-bold uppercase text-red-600">
                ! Thiếu thông tin
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-energy bg-[var(--energy-lime-soft)] p-4">
            <div className="mb-2 flex justify-between text-xs font-bold text-forest">
              <span>ĐỘ CHÍNH XÁC AI ĐÁNH GIÁ</span>
              <span>50%</span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
              <div className="h-full w-1/2 bg-energy"></div>
            </div>
            <div className="text-[10px] font-medium text-forest/60">
              Thêm thông tin để AI Pose giảm{' '}
              <span className="font-bold">40% sai số nội suy ngoại biên</span>.
            </div>
          </div>

          <Button className="mt-6 h-12 w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90">
            HOÀN TẤT HỒ SƠ
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Action 1 */}
        <div className="group flex flex-col items-center justify-between gap-6 rounded-xl border border-forest/20 bg-white p-6 transition-colors hover:border-mint sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-forest/20">
            <Activity className="h-5 w-5 text-forest" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/50">
              MODULAR ACTION // 01
            </div>
            <h3 className="mb-2 font-syne text-xl font-bold leading-tight text-forest">
              KÍCH HOẠT
              <br />
              PHIÊN TẬP HÔM NAY
            </h3>
            <p className="mx-auto max-w-[200px] text-xs font-medium leading-relaxed text-forest/70 sm:mx-0">
              Nap giáo án trực tiếp vào giao diện đếm nhịp. Thời gian nghỉ và quản lý lỗi form tự
              động.
            </p>
          </div>
          <Button className="shrink-0 rounded-full bg-forest px-6 font-bold text-white transition-colors hover:bg-forest/90 group-hover:bg-mint group-hover:text-forest">
            Bắt đầu ngay &rarr;
          </Button>
        </div>

        {/* Quick Action 2 */}
        <div className="group flex flex-col items-center justify-between gap-6 rounded-xl border border-forest/20 bg-white p-6 transition-colors hover:border-mint sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-forest/20">
            <Camera className="h-5 w-5 text-forest" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/50">
              COMPUTER VISION // 02
            </div>
            <h3 className="mb-2 font-syne text-xl font-bold leading-tight text-forest">
              CHẤM DÁNG
              <br />
              AI BẰNG VIDEO
            </h3>
            <p className="mx-auto max-w-[200px] text-xs font-medium leading-relaxed text-forest/70 sm:mx-0">
              Quay 1 video nháp xương phát hiện lỗi. So tỷ lệ Rep 3D Pose-Net & Tiêu chuẩn của HLV.
            </p>
          </div>
          <Button className="shrink-0 rounded-full bg-forest px-6 font-bold text-white transition-colors hover:bg-forest/90">
            Quay video form &uarr;
          </Button>
        </div>
      </div>

      {/* Biometric Chart Area */}
      <div className="rounded-xl border border-forest/20 bg-white p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-forest/50">
              BIOMETRIC TRACKING // TỔNG QUAN 7 NGÀY QUA
            </div>
            <h3 className="font-syne text-2xl font-bold text-forest">Chu kỳ Biometric Tuần 14</h3>
          </div>
          <div className="flex gap-2">
            <Button className="h-8 rounded-full bg-forest text-xs font-bold text-white hover:bg-forest/90">
              Phân Tích AI (Premium)
            </Button>
            <Button
              variant="outline"
              className="h-8 rounded-full border-forest/20 text-xs font-bold text-forest"
            >
              Kế hoạch Tuần tới
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="border-energy/50 relative flex h-[300px] flex-col overflow-hidden rounded-lg border bg-[var(--energy-lime-faint)] p-6 lg:col-span-2">
            <div className="mb-8 flex justify-between text-xs font-bold text-forest/60">
              <span>VOLUME LOAD (KG) / NGÀY</span>
              <span>
                MỨC ĐỈNH: <span className="text-forest">18,250 KG</span>
              </span>
            </div>

            {/* Decorative Chart (SVG Placeholder mimicking the mockup) */}
            <div className="relative h-full w-full flex-1 border-b border-l border-forest/10 pb-4">
              <svg
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                {/* Y Axis Grid lines */}
                <line
                  x1="0"
                  y1="20"
                  x2="100"
                  y2="20"
                  stroke="#345C32"
                  strokeOpacity="0.05"
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="40"
                  x2="100"
                  y2="40"
                  stroke="#345C32"
                  strokeOpacity="0.05"
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="60"
                  x2="100"
                  y2="60"
                  stroke="#345C32"
                  strokeOpacity="0.05"
                  strokeWidth="0.5"
                />
                <line
                  x1="0"
                  y1="80"
                  x2="100"
                  y2="80"
                  stroke="#345C32"
                  strokeOpacity="0.05"
                  strokeWidth="0.5"
                />

                {/* Area Fill */}
                <polygon
                  points="5,80 25,60 45,90 65,50 85,30 85,100 5,100"
                  fill="#345C32"
                  fillOpacity="0.05"
                />
                {/* The Line */}
                <polyline
                  points="5,80 25,60 45,90 65,50 85,30"
                  fill="none"
                  stroke="#345C32"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Data points */}
                <circle cx="5" cy="80" r="1.5" fill="#A7F0DD" stroke="#345C32" strokeWidth="0.5" />
                <circle cx="25" cy="60" r="1.5" fill="#A7F0DD" stroke="#345C32" strokeWidth="0.5" />
                <circle cx="45" cy="90" r="1.5" fill="#A7F0DD" stroke="#345C32" strokeWidth="0.5" />
                <circle cx="65" cy="50" r="1.5" fill="#A7F0DD" stroke="#345C32" strokeWidth="0.5" />

                {/* Highlight Point */}
                <circle
                  cx="85"
                  cy="30"
                  r="2.5"
                  fill="var(--energy-lime)"
                  stroke="#345C32"
                  strokeWidth="1"
                />

                {/* X Axis Labels */}
                <text x="5" y="108" fontSize="3" fill="#345C32" opacity="0.5" textAnchor="middle">
                  T2
                </text>
                <text x="25" y="108" fontSize="3" fill="#345C32" opacity="0.5" textAnchor="middle">
                  T3
                </text>
                <text x="45" y="108" fontSize="3" fill="#345C32" opacity="0.5" textAnchor="middle">
                  T4
                </text>
                <text x="65" y="108" fontSize="3" fill="#345C32" opacity="0.5" textAnchor="middle">
                  T5
                </text>
                <text x="85" y="108" fontSize="3" fill="#345C32" opacity="0.5" textAnchor="middle">
                  HÔM NAY
                </text>
              </svg>
              {/* Y Axis Labels overlay */}
              <div className="absolute bottom-0 left-[-25px] flex h-full flex-col items-end justify-between pb-4 pt-1 text-[8px] font-medium text-forest/50">
                <span>20,000</span>
                <span>15,000</span>
                <span>10,000</span>
                <span>5,000</span>
                <span>0</span>
              </div>
            </div>
          </div>

          <div className="flex h-[300px] flex-col justify-between gap-4">
            <div className="flex flex-1 flex-col justify-center rounded-lg border border-forest/10 p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                CHU KỲ TẬP TUẦN NÀY
              </div>
              <div className="mb-2 flex items-end justify-between">
                <div className="font-syne text-3xl font-bold text-forest">
                  3 <span className="text-forest/30">/ 5</span>
                </div>
                <span className="rounded-sm border border-forest/20 bg-energy px-2 py-1 text-[9px] font-bold uppercase text-forest">
                  ON TRACK
                </span>
              </div>
              <div className="text-xs font-medium text-forest/70">
                Còn hoàn thành 2 phiên nữa để đạt Hypertrophy Index.
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center rounded-lg border border-forest/10 p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                TỔNG KHỐI LƯỢNG MỚI
              </div>
              <div className="mb-2 flex items-end justify-between">
                <div className="font-syne text-3xl font-bold text-forest">
                  57.5 <span className="text-lg font-medium text-forest/50">KG</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-forest">+1.5 KG/TUẦN</span>
              </div>
              <div className="text-xs font-medium text-forest/70">
                Tổng khối lượng dỡ 3 tuần trước.
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center rounded-lg border border-forest/10 bg-[var(--energy-lime-soft)] p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-forest/50">
                ĐIỂM KỸ THUẬT AI FORM-NET
              </div>
              <div className="mb-2 flex items-end justify-between">
                <div className="font-syne text-3xl font-bold text-forest">
                  93.4 <span className="text-lg font-medium text-forest/50">/ 100</span>
                </div>
                <span className="rounded-sm bg-energy px-2 py-1 text-[9px] font-bold uppercase text-forest">
                  RẤT TỐT
                </span>
              </div>
              <div className="text-xs font-medium text-forest/70">
                Thực thể lưng dọc ở góc trung bình đạt 94.7%.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-forest/10 pt-4">
          <div className="text-[10px] font-medium text-forest/60">
            * Hệ thống phân tích ngày / tuần ẩn dữ liệu chưa học, thông số có thể thay đổi sau phiên
            học nháp lần mới của bạn.
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-forest/60">
            DATA INTEGRITY: SQL RAW
          </div>
        </div>
      </div>
    </div>
  );
}
