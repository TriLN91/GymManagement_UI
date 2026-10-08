export function AISection() {
  return (
    <section
      id="ai-features"
      className="container mx-auto border-y border-forest/10 bg-white px-4 py-24"
    >
      <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <h2 className="max-w-lg font-syne text-4xl font-bold leading-tight text-forest md:text-5xl">
          Huấn Luyện Viên AI Cá Nhân Hóa.
        </h2>
        <p className="max-w-md font-sans font-medium text-forest/70">
          Mô hình chuẩn đoán biomechanics được hỗ trợ bởi trí tuệ nhân tạo. Hệ thống không chỉ phân
          tích mà còn tinh chỉnh và đề xuất kế hoạch tập luyện phù hợp với cơ địa của từng cá nhân.
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-3">
        <div className="flex flex-col border-t-2 border-forest pt-6">
          <div className="mb-4 flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/50">
              01 / FEATURE
            </span>
            <span className="rounded-full bg-mint px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
              REAL-TIME
            </span>
          </div>
          <h3 className="mb-4 font-syne text-2xl font-bold text-forest">AI Video Analysis.</h3>
          <p className="mb-8 flex-1 font-sans font-medium leading-relaxed text-forest/80">
            Phân tích kỹ thuật chuyển động qua thiết bị di động trong thời gian thực. Computer
            vision & AI giúp phát hiện sai lệch tư thế, đo đếm góc độ khớp và đưa ra gợi ý sửa đổi
            ngay lập tức để tối ưu hóa hiệu suất.
          </p>
          <div className="flex items-center justify-between border-b border-forest pb-2 text-xs font-bold uppercase tracking-wider text-forest">
            <span>Explore Feature</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div className="flex flex-col border-t-2 border-forest pt-6">
          <div className="mb-4 flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/50">
              02 / FEATURE
            </span>
            <span className="rounded-full bg-forest px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-mint">
              SMART PLAN
            </span>
          </div>
          <h3 className="mb-4 font-syne text-2xl font-bold text-forest">Adaptive Planning.</h3>
          <p className="mb-8 flex-1 font-sans font-medium leading-relaxed text-forest/80">
            Lộ trình tập luyện được điều chỉnh linh hoạt dựa trên dữ liệu hiệu suất hàng ngày. AI
            đánh giá mức độ phục hồi, khối lượng tạ, và tiến độ để tự động tái phân bổ các bài tập,
            đảm bảo bạn không bị quá tải.
          </p>
          <div className="flex items-center justify-between border-b border-forest pb-2 text-xs font-bold uppercase tracking-wider text-forest">
            <span>Explore Feature</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div className="flex flex-col border-t-2 border-forest pt-6">
          <div className="mb-4 flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/50">
              03 / FEATURE
            </span>
            <span className="rounded-full border border-forest px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
              PROGRESSION
            </span>
          </div>
          <h3 className="mb-4 font-syne text-2xl font-bold text-forest">WORKOUT TRACKING.</h3>
          <p className="mb-8 flex-1 font-sans font-medium leading-relaxed text-forest/80">
            Theo dõi khối lượng tạ, volume, chu kỳ bài tập qua thời gian thực. Mô hình đánh giá 1RM
            và sức bền cơ bắp tự động qua từng hiệp tập. Dữ liệu ghi lại chi tiết mọi buổi tập
            luyện.
          </p>
          <div className="flex items-center justify-between border-b border-forest pb-2 text-xs font-bold uppercase tracking-wider text-forest">
            <span>Explore Feature</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>
    </section>
  );
}
