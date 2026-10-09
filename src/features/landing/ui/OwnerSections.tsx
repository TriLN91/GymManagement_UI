import { LandingButton } from './LandingButton';

import { ROUTES } from '@/shared/config/constants';

const STEPS = [
  [
    '01 / HOÀN THIỆN',
    'Giới thiệu phòng tập.',
    'Bổ sung vị trí, tiện ích và hình ảnh thể hiện đúng không gian, dịch vụ của bạn.',
  ],
  ['02 / XÉT DUYỆT', 'Sẵn sàng hiện diện.', 'Gửi hồ sơ phòng tập để được xét duyệt trên nền tảng.'],
  [
    '03 / KẾT NỐI',
    'Đến gần người tập.',
    'Đưa gói tập, gói PT và đội ngũ huấn luyện viên đến người đang tìm nơi tập.',
  ],
];

export function OwnerSections() {
  return (
    <>
      <section className="fit-hero" aria-labelledby="fit-owner-title">
        <div className="fit-two-column">
          <div>
            <span className="fit-label">
              <i className="fit-dot" /> FIT® / DÀNH CHO CHỦ PHÒNG TẬP
            </span>
            <h1 id="fit-owner-title">
              Phòng tập của bạn.
              <br />
              <em>Vươn xa hơn.</em>
            </h1>
            <p>
              Đưa phòng tập, gói dịch vụ và đội ngũ huấn luyện viên đến với người đang tìm kiếm nơi
              tập phù hợp.
            </p>
            <div className="fit-hero-actions">
              <LandingButton to={ROUTES.public.register}>Đăng ký đối tác</LandingButton>
            </div>
          </div>
          <div className="fit-owner-visual" aria-label="Minh họa hồ sơ phòng tập trên nền tảng">
            <div className="fit-label fit-visual-top">
              <span>KHÁM PHÁ PHÒNG TẬP</span>
              <span>HÌNH MINH HỌA</span>
            </div>
            <div className="fit-gym-architecture" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <strong>
                FIT<sup>®</sup>
              </strong>
            </div>
            <div className="fit-owner-profile">
              <h3>
                Được tìm thấy.
                <br />
                Được lựa chọn.
              </h3>
              <div>
                <span>Phòng tập</span>
                <span>Gói dịch vụ</span>
                <span>Huấn luyện viên</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="fit-section">
        <div className="fit-section-heading">
          <h2>
            Một hồ sơ rõ ràng.
            <br />
            Một điểm bắt đầu.
          </h2>
          <p>Ba bước để phòng tập của bạn có mặt trên nền tảng và đến gần người tập hơn.</p>
        </div>
        <div className="fit-steps">
          {STEPS.map(([label, title, body]) => (
            <article key={label}>
              <span className="fit-label">{label}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="fit-section fit-soft">
        <div className="fit-two-column">
          <div>
            <h2>
              Dịch vụ rõ ràng.
              <br />
              <em>Giao dịch minh bạch.</em>
            </h2>
            <p>
              Công bố quyền lợi, thời hạn và giá của từng gói tập hoặc gói PT. Theo dõi giao dịch và
              đối soát ngay trên nền tảng.
            </p>
            <p className="fit-footnote">
              Hoa hồng 10% áp dụng trên phần dịch vụ phòng tập. Phần AI Plus của nền tảng được tách
              riêng.
            </p>
          </div>
          <div className="fit-offer-visual">
            <span className="fit-label">CẤU TRÚC GÓI / MINH HỌA</span>
            {[
              ['01', 'Quyền lợi', 'Dịch vụ được cung cấp'],
              ['02', 'Thời hạn', 'Thời gian sử dụng gói'],
              ['03', 'Giá bán', 'Chi phí được công bố'],
              ['04', 'Điều kiện', 'Thông tin trước khi mua'],
            ].map(([n, title, body]) => (
              <div className="fit-offer-row" key={n}>
                <span className="fit-label">{n}</span>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="fit-section fit-final">
        <h2>
          Giá trị của bạn.
          <br />
          <em>Đến đúng người.</em>
        </h2>
        <LandingButton to={ROUTES.public.register}>Đăng ký đối tác</LandingButton>
      </section>
    </>
  );
}
