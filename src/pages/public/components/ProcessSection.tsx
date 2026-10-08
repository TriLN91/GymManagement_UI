export function ProcessSection() {
  const steps = [
    {
      num: '01',
      title: 'Đánh giá Cơ thể',
      desc: 'Sử dụng AI Tracking để phân tích dáng đứng, tỉ lệ cơ bắp.',
    },
    {
      num: '02',
      title: 'Phân tích Động',
      desc: 'Kiểm tra phạm vi chuyển động qua các bài kiểm tra AI.',
    },
    {
      num: '03',
      title: 'Nhận Kế Hoạch',
      desc: 'Hệ thống AI tự động đề xuất lộ trình luyện tập phù hợp.',
    },
    {
      num: '04',
      title: 'Tập Luyện',
      desc: 'Được hướng dẫn thời gian thực qua camera AI ở mỗi buổi.',
    },
    {
      num: '05',
      title: 'Theo Dõi Tiến Độ',
      desc: 'Dashboard đánh giá thay đổi và điều chỉnh mức tạ.',
    },
    {
      num: '06',
      title: 'Tối Ưu Liên Tục',
      desc: 'Mô hình học máy sẽ cập nhật kế hoạch hàng tháng.',
    },
  ];

  return (
    <section className="container mx-auto bg-[#F3F6F2] px-4 py-24">
      <div className="mb-16 border-b-2 border-forest pb-6">
        <h2 className="mb-4 font-syne text-4xl font-bold text-forest">Tiến Trình Huấn Luyện.</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="mb-4 border-b border-forest/20 pb-4 font-syne text-3xl font-bold text-forest">
              {step.num}
            </div>
            <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-forest">
              {step.title}
            </h4>
            <p className="font-sans text-xs font-medium leading-relaxed text-forest/70">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
