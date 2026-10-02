export function ProcessSection() {
  const steps = [
    { num: '01', title: 'Đánh giá Cơ thể', desc: 'Sử dụng AI Tracking để phân tích dáng đứng, tỉ lệ cơ bắp.' },
    { num: '02', title: 'Phân tích Động', desc: 'Kiểm tra phạm vi chuyển động qua các bài kiểm tra AI.' },
    { num: '03', title: 'Nhận Kế Hoạch', desc: 'Hệ thống AI tự động đề xuất lộ trình luyện tập phù hợp.' },
    { num: '04', title: 'Tập Luyện', desc: 'Được hướng dẫn thời gian thực qua camera AI ở mỗi buổi.' },
    { num: '05', title: 'Theo Dõi Tiến Độ', desc: 'Dashboard đánh giá thay đổi và điều chỉnh mức tạ.' },
    { num: '06', title: 'Tối Ưu Liên Tục', desc: 'Mô hình học máy sẽ cập nhật kế hoạch hàng tháng.' },
  ];

  return (
    <section className="container mx-auto px-4 py-24 bg-[#F3F6F2]">
      <div className="mb-16 border-b-2 border-forest pb-6">
        <h2 className="font-syne text-4xl font-bold text-forest mb-4">
          Tiến Trình Huấn Luyện.
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="font-syne text-3xl font-bold text-forest mb-4 pb-4 border-b border-forest/20">
              {step.num}
            </div>
            <h4 className="font-bold text-forest text-sm mb-2 uppercase tracking-wider">{step.title}</h4>
            <p className="font-sans text-forest/70 text-xs font-medium leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
