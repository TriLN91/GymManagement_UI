export function AISection() {
  return (
    <section id="ai-features" className="container mx-auto px-4 py-24 bg-white border-y border-forest/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <h2 className="font-syne text-4xl md:text-5xl font-bold text-forest max-w-lg leading-tight">
          Huấn Luyện Viên AI Cá Nhân Hóa.
        </h2>
        <p className="font-sans text-forest/70 max-w-md font-medium">
          Mô hình chuẩn đoán biomechanics được hỗ trợ bởi trí tuệ nhân tạo.
          Hệ thống không chỉ phân tích mà còn tinh chỉnh và đề xuất kế hoạch tập luyện phù hợp với cơ địa của từng cá nhân.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="flex flex-col border-t-2 border-forest pt-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/50">01 / FEATURE</span>
            <span className="bg-mint text-forest text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">REAL-TIME</span>
          </div>
          <h3 className="font-syne text-2xl font-bold text-forest mb-4">AI Video Analysis.</h3>
          <p className="font-sans text-forest/80 font-medium leading-relaxed mb-8 flex-1">
            Phân tích kỹ thuật chuyển động qua thiết bị di động trong thời gian thực.
            Computer vision & AI giúp phát hiện sai lệch tư thế, đo đếm góc độ khớp và đưa ra gợi ý sửa đổi ngay lập tức để tối ưu hóa hiệu suất.
          </p>
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-forest border-b border-forest pb-2">
            <span>Explore Feature</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div className="flex flex-col border-t-2 border-forest pt-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/50">02 / FEATURE</span>
            <span className="bg-forest text-mint text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">SMART PLAN</span>
          </div>
          <h3 className="font-syne text-2xl font-bold text-forest mb-4">Adaptive Planning.</h3>
          <p className="font-sans text-forest/80 font-medium leading-relaxed mb-8 flex-1">
            Lộ trình tập luyện được điều chỉnh linh hoạt dựa trên dữ liệu hiệu suất hàng ngày.
            AI đánh giá mức độ phục hồi, khối lượng tạ, và tiến độ để tự động tái phân bổ các bài tập, đảm bảo bạn không bị quá tải.
          </p>
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-forest border-b border-forest pb-2">
            <span>Explore Feature</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div className="flex flex-col border-t-2 border-forest pt-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-forest/50">03 / FEATURE</span>
            <span className="border border-forest text-forest text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">PROGRESSION</span>
          </div>
          <h3 className="font-syne text-2xl font-bold text-forest mb-4">WORKOUT TRACKING.</h3>
          <p className="font-sans text-forest/80 font-medium leading-relaxed mb-8 flex-1">
            Theo dõi khối lượng tạ, volume, chu kỳ bài tập qua thời gian thực. 
            Mô hình đánh giá 1RM và sức bền cơ bắp tự động qua từng hiệp tập.
            Dữ liệu ghi lại chi tiết mọi buổi tập luyện.
          </p>
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-forest border-b border-forest pb-2">
            <span>Explore Feature</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>
    </section>
  );
}
