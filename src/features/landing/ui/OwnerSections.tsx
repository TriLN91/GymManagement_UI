import { ArrowUpRight } from 'lucide-react';

import { LandingButton } from './LandingButton';

import { ROUTES } from '@/shared/config/constants';

export function OwnerSections() {
  return (
    <>
      <section className="fit-owner-hero fit-section">
        <div className="fit-label fit-owner-eyebrow">
          <span>
            <i className="fit-dot" /> FIT® / DÀNH CHO CHỦ PHÒNG TẬP
          </span>
          <span>KẾT NỐI. GIỚI THIỆU. PHÁT TRIỂN.</span>
        </div>
        <div className="fit-two-column">
          <div>
            <h1>
              Phòng tập
              <br />
              của bạn.
              <br />
              <em>Vươn xa hơn.</em>
            </h1>
            <p>
              Đưa phòng tập, gói dịch vụ và đội ngũ huấn luyện viên đến với người đang tìm kiếm nơi
              tập phù hợp.
            </p>
            <LandingButton to={ROUTES.public.register}>Đăng ký đối tác</LandingButton>
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
              <span className="fit-label">KHÔNG GIAN CỦA BẠN. DẤU ẤN RIÊNG.</span>
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
      <section className="fit-section" id="fit-owner-presence">
        <p className="fit-label fit-section-label">
          <span>01</span> HIỆN DIỆN TRÊN NỀN TẢNG
        </p>
        <div className="fit-section-heading">
          <h2>
            Một hồ sơ rõ ràng.
            <br />
            Một điểm bắt đầu.
          </h2>
          <p>
            Giới thiệu vị trí, tiện ích và hình ảnh phòng tập để người tập có thông tin cần thiết
            trước khi lựa chọn.
          </p>
        </div>
        <div className="fit-coach-steps">
          {[
            [
              '01 / HOÀN THIỆN',
              'Giới thiệu phòng tập.',
              'Bổ sung thông tin và hình ảnh thể hiện đúng không gian, dịch vụ của bạn.',
            ],
            [
              '02 / XÉT DUYỆT',
              'Sẵn sàng hiện diện.',
              'Gửi hồ sơ phòng tập để được xét duyệt trên nền tảng.',
            ],
            [
              '03 / KẾT NỐI',
              'Đến gần người tập.',
              'Đưa các gói dịch vụ đã công bố đến người dùng đang khám phá phòng tập.',
            ],
          ].map(([label, title, body]) => (
            <article key={label}>
              <span className="fit-label">{label}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="fit-section fit-workout">
        <p className="fit-label fit-section-label">
          <span>02</span> GÓI DỊCH VỤ
        </p>
        <div className="fit-two-column">
          <div>
            <h2>
              Dịch vụ rõ ràng.
              <br />
              <em>Lựa chọn dễ hơn.</em>
            </h2>
            <p>
              Công bố quyền lợi, thời hạn và giá của từng gói tập hoặc gói PT. Giúp khách hàng hiểu
              mình sẽ nhận được gì.
            </p>
            <LandingButton to={ROUTES.public.register} outline>
              Giới thiệu dịch vụ của bạn
            </LandingButton>
          </div>
          <div className="fit-offer-visual">
            <span className="fit-label">CẤU TRÚC GÓI / MINH HỌA</span>
            <h3>
              Một gói dịch vụ.
              <br />
              Đủ thông tin.
            </h3>
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
      <section className="fit-section fit-dark">
        <p className="fit-label fit-section-label">
          <span>03</span> KẾT NỐI GIÁ TRỊ SỐ
        </p>
        <div className="fit-section-heading">
          <h2>
            Dịch vụ phòng tập.
            <br />
            <em>Thêm giá trị AI.</em>
          </h2>
          <p>
            Kết hợp dịch vụ phòng tập với AI Plus theo điều kiện của nền tảng. Thông tin từng phần
            được thể hiện rõ trong gói.
          </p>
        </div>
        <div className="fit-owner-equation">
          <span>
            Dịch vụ
            <br />
            phòng tập
          </span>
          <b>+</b>
          <span>
            AI Plus
            <br />
            của nền tảng
          </span>
          <ArrowUpRight aria-hidden="true" size={48} />
        </div>
        <p className="fit-footnote">
          AI Plus là dịch vụ số của nền tảng. Quyền lợi và thời hạn áp dụng theo gói được công bố.
        </p>
      </section>
      <section className="fit-section">
        <p className="fit-label fit-section-label">
          <span>04</span> ĐỘI NGŨ HUẤN LUYỆN VIÊN
        </p>
        <div className="fit-section-heading">
          <h2>
            Con người tạo nên
            <br />
            sự khác biệt.
          </h2>
          <p>
            Giới thiệu huấn luyện viên thuộc phòng tập và các gói PT. Kết nối chuyên môn của đội ngũ
            với nhu cầu của người tập.
          </p>
        </div>
        <div className="fit-editorial-list fit-owner-list">
          {[
            [
              '01',
              'Hồ sơ chuyên môn.',
              'Giúp người tập hiểu về huấn luyện viên trước khi lựa chọn gói PT.',
            ],
            [
              '02',
              'Đồng hành có dữ liệu.',
              'Huấn luyện viên theo dõi dữ liệu được cho phép và xây dựng giáo án cho khách hàng.',
            ],
            [
              '03',
              'Lịch hẹn rõ ràng.',
              'Huấn luyện viên chủ động tạo lịch hẹn trong quá trình đồng hành.',
            ],
          ].map(([n, title, body]) => (
            <article key={n}>
              <span className="fit-label">{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="fit-section fit-performance">
        <p className="fit-label fit-section-label">
          <span>05</span> GIAO DỊCH MINH BẠCH
        </p>
        <div className="fit-two-column">
          <div>
            <h2>
              Hiểu rõ giao dịch.
              <br />
              <em>Chủ động kinh doanh.</em>
            </h2>
            <p>Theo dõi giao dịch gói dịch vụ và thông tin đối soát trên nền tảng.</p>
          </div>
          <div className="fit-commission">
            <strong>
              10<small>%</small>
            </strong>
            <h3>Hoa hồng dịch vụ Gym</h3>
            <p>Áp dụng trên phần dịch vụ phòng tập. Phần AI Plus của nền tảng được tách riêng.</p>
          </div>
        </div>
      </section>
      <section className="fit-section">
        <p className="fit-label fit-section-label">
          <span>06</span> TẬP TRUNG ĐÚNG NHU CẦU
        </p>
        <div className="fit-section-heading">
          <h2>
            Từ hiện diện.
            <br />
            Đến kết nối.
          </h2>
          <p>
            Một nơi để giới thiệu phòng tập, công bố dịch vụ và theo dõi hoạt động kinh doanh trên
            nền tảng.
          </p>
        </div>
        <div className="fit-owner-summary">
          {[
            'Hồ sơ phòng tập',
            'Gói tập & gói PT',
            'Đội ngũ huấn luyện viên',
            'Giao dịch & đối soát',
          ].map((title, i) => (
            <div key={title}>
              <span className="fit-label">0{i + 1}</span>
              <h3>{title}</h3>
              <ArrowUpRight aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>
      <section className="fit-section fit-dark fit-final">
        <p className="fit-label">FIT® / ĐỒNG HÀNH CÙNG PHÒNG TẬP</p>
        <h2>
          Giá trị của bạn.
          <br />
          <em>Đến đúng người.</em>
        </h2>
        <div className="fit-final-bottom">
          <p>
            Bắt đầu từ phòng tập của bạn.
            <br />
            Kết nối với hệ sinh thái Fit®.
          </p>
          <LandingButton to={ROUTES.public.register}>Đăng ký đối tác</LandingButton>
        </div>
      </section>
    </>
  );
}
