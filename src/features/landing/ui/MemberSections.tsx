import { ArrowDown, ArrowUpRight, Check, Dumbbell, Play } from 'lucide-react';

import { LandingButton } from './LandingButton';
import { MovementVisual } from './MovementVisual';

import { ROUTES } from '@/shared/config/constants';

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <p className="fit-label fit-section-label">
      <span>{number}</span>
      {children}
    </p>
  );
}

export function MemberSections() {
  return (
    <>
      <section id="fit-movement" className="fit-section fit-movement">
        <SectionLabel number="01">HIỂU TỪNG CHUYỂN ĐỘNG</SectionLabel>
        <div className="fit-section-heading">
          <h2>
            Mỗi chuyển động.
            <br />
            Một dữ liệu.
          </h2>
          <p>
            Quay hoặc tải video bài tập. AI phân tích tư thế, chỉ ra điểm cần điều chỉnh và giúp bạn
            hiểu cách mình đang vận động.
          </p>
        </div>
        <div className="fit-two-column">
          <MovementVisual />
          <div className="fit-editorial-list">
            {[
              [
                '01',
                'Nhìn rõ tư thế.',
                'Xem lại chuyển động cùng các điểm khớp và dấu mốc trong video.',
              ],
              [
                '02',
                'Hiểu điều cần sửa.',
                'Phản hồi gắn với từng thời điểm, để bạn biết nên điều chỉnh ở đâu.',
              ],
              [
                '03',
                'Tập tốt hơn mỗi lần.',
                'Lưu kết quả đánh giá để theo dõi sự thay đổi qua các buổi tập.',
              ],
            ].map(([n, title, body]) => (
              <article key={n}>
                <span className="fit-label">{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
                <ArrowUpRight size={20} aria-hidden="true" />
              </article>
            ))}
            <p className="fit-footnote">
              Quá trình đánh giá diễn ra ở nền. Bạn có thể tiếp tục khám phá trong khi chờ kết quả.
            </p>
          </div>
        </div>
      </section>
      <section className="fit-section fit-workout" id="fit-workout">
        <SectionLabel number="02">TẬP LUYỆN CÓ ĐỊNH HƯỚNG</SectionLabel>
        <div className="fit-two-column fit-workout-grid">
          <div className="fit-workout-copy">
            <h2>
              Tập trung
              <br />
              vào lần tập
              <br />
              <em>tiếp theo.</em>
            </h2>
            <p>
              Từ giáo án đến từng hiệp tập. Theo dõi mục tiêu và kết quả thực hiện trong cùng một
              hành trình rõ ràng.
            </p>
            <LandingButton to={ROUTES.public.register}>Khám phá trải nghiệm tập</LandingButton>
          </div>
          <div className="fit-workout-preview">
            <div className="fit-visual-top fit-label">
              <span>BUỔI TẬP CỦA BẠN</span>
              <span>GIAO DIỆN MINH HỌA</span>
            </div>
            <div className="fit-workout-preview-title">
              <h3>
                Sức mạnh
                <br />
                thân trên.
              </h3>
              <span className="fit-round-icon">
                <Dumbbell size={30} />
              </span>
            </div>
            <div className="fit-days" aria-label="Lịch tập minh họa">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
                <span className={i === 2 ? 'is-selected' : ''} key={d}>
                  {d}
                </span>
              ))}
            </div>
            <div className="fit-prescription-head fit-label">
              <span>BÀI TẬP</span>
              <span>MỤC TIÊU</span>
              <span>THỰC TẾ</span>
            </div>
            {[
              ['Đẩy ngực với tạ', '3 × 12', '3 × 12'],
              ['Kéo tạ một tay', '3 × 10', '2 × 10'],
              ['Plank', '45 giây', '—'],
            ].map(([name, target, actual], i) => (
              <div key={name} className="fit-prescription-row">
                <span>
                  <small>0{i + 1}</small>
                  {name}
                </span>
                <span>{target}</span>
                <strong>
                  {actual}
                  {i === 0 && <Check size={13} />}
                </strong>
              </div>
            ))}
            <div className="fit-workout-preview-bottom">
              <span className="fit-label">
                MỤC TIÊU RÕ RÀNG.
                <br />
                KẾT QUẢ ĐƯỢC GHI LẠI.
              </span>
              <Play size={22} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
      <section className="fit-section fit-dark fit-coach" id="fit-coach">
        <SectionLabel number="03">HUẤN LUYỆN CÁ NHÂN HÓA</SectionLabel>
        <div className="fit-section-heading">
          <h2>
            Dữ liệu trở thành
            <br />
            <em>sự tiến bộ.</em>
          </h2>
          <p>
            AI kết nối mục tiêu, kinh nghiệm và lịch sử tập luyện để đưa ra gợi ý phù hợp với bạn.
          </p>
        </div>
        <div className="fit-coach-steps">
          <article>
            <span className="fit-label">01 / HIỂU BẠN</span>
            <h3>
              Mục tiêu
              <br />
              của riêng bạn.
            </h3>
            <p>Bắt đầu từ thể trạng, kinh nghiệm và điều bạn muốn đạt được.</p>
          </article>
          <article>
            <span className="fit-label">02 / LÊN KẾ HOẠCH</span>
            <h3>
              Một lộ trình.
              <br />
              Có định hướng.
            </h3>
            <p>Gợi ý tập luyện dựa trên những dữ liệu bạn cung cấp.</p>
          </article>
          <article>
            <span className="fit-label">03 / THÍCH ỨNG</span>
            <h3>
              Tiến lên.
              <br />
              Cùng nhịp của bạn.
            </h3>
            <p>Những buổi tập mới giúp định hướng cho các đề xuất tiếp theo.</p>
          </article>
        </div>
        <div className="fit-coach-closing">
          <span>THỂ TRẠNG</span>
          <span>→</span>
          <span>KẾ HOẠCH</span>
          <span>→</span>
          <span>TẬP LUYỆN</span>
          <span>→</span>
          <span>PHẢN HỒI</span>
        </div>
      </section>
      <section className="fit-section fit-trainer" id="fit-trainer">
        <SectionLabel number="04">KẾT NỐI HUẤN LUYỆN VIÊN</SectionLabel>
        <div className="fit-two-column">
          <div>
            <h2>
              Trí tuệ AI.
              <br />
              Sự thấu hiểu
              <br />
              <em>từ con người.</em>
            </h2>
            <p>
              Chọn huấn luyện viên thuộc phòng tập phù hợp. Khi bắt đầu gói PT, huấn luyện viên có
              thể xem dữ liệu được cho phép, điều chỉnh giáo án và đồng hành với bạn.
            </p>
            <LandingButton to={ROUTES.public.register} outline>
              Kết nối huấn luyện viên
            </LandingButton>
          </div>
          <div
            className="fit-coaching-diagram"
            role="img"
            aria-label="Huấn luyện viên kết nối mục tiêu, dữ liệu tập luyện và phản hồi của hội viên"
          >
            <span className="fit-label fit-diagram-top">HUẤN LUYỆN DỰA TRÊN DỮ LIỆU</span>
            <div className="fit-orbit fit-orbit--outer" />
            <div className="fit-orbit fit-orbit--inner" />
            <div className="fit-orbit-center">
              BẠN<span>Ở TRUNG TÂM</span>
            </div>
            <span className="fit-orbit-tag fit-orbit-tag--one">Mục tiêu</span>
            <span className="fit-orbit-tag fit-orbit-tag--two">Huấn luyện viên</span>
            <span className="fit-orbit-tag fit-orbit-tag--three">Phân tích AI</span>
            <span className="fit-label fit-diagram-bottom">
              CÔNG NGHỆ HỖ TRỢ. CON NGƯỜI ĐỒNG HÀNH.
            </span>
          </div>
        </div>
      </section>
      <section className="fit-section fit-ecosystem" id="fit-ecosystem">
        <SectionLabel number="05">HỆ SINH THÁI FIT®</SectionLabel>
        <div className="fit-section-heading">
          <h2>
            Đúng nơi tập.
            <br />
            Đúng người đồng hành.
          </h2>
          <p>Khám phá phòng tập, tìm gói PT và kết nối với những giá trị số từ AI Plus.</p>
        </div>
        <div className="fit-ecosystem-row">
          {[
            [
              '01',
              'Phòng tập.',
              'Tìm theo khu vực và loại hình phù hợp với nhu cầu của bạn.',
              'GYM',
            ],
            [
              '02',
              'Huấn luyện viên.',
              'Khám phá huấn luyện viên và các gói PT do phòng tập cung cấp.',
              'PT',
            ],
            [
              '03',
              'AI Plus.',
              'Dịch vụ số của nền tảng, mua riêng hoặc đi kèm gói dịch vụ đủ điều kiện.',
              'PLUS',
            ],
          ].map(([n, title, body, mark]) => (
            <article key={n}>
              <div className="fit-ecosystem-mark">
                {mark}
                <ArrowUpRight size={28} aria-hidden="true" />
              </div>
              <span className="fit-label">{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="fit-section fit-performance" id="fit-performance">
        <SectionLabel number="06">NHÌN THẤY SỰ TIẾN BỘ</SectionLabel>
        <div className="fit-section-heading">
          <h2>
            Nỗ lực của bạn.
            <br />
            Có thể nhìn thấy.
          </h2>
          <p>Theo dõi buổi tập, số lần thực hiện và kết quả phân tích theo thời gian.</p>
        </div>
        <div className="fit-metrics">
          <div>
            <strong>
              98.7<small>%</small>
            </strong>
            <span>Phân tích tư thế</span>
          </div>
          <div>
            <strong>42</strong>
            <span>Buổi tập</span>
          </div>
          <div>
            <strong>
              18.4<small>K</small>
            </strong>
            <span>Lần thực hiện</span>
          </div>
        </div>
        <div className="fit-metrics-note">
          <span className="fit-label">SỐ LIỆU MINH HỌA</span>
          <p>
            Các con số mô phỏng trải nghiệm sản phẩm, không phải kết quả đo thực tế hoặc cam kết về
            độ chính xác AI.
          </p>
        </div>
      </section>
      <section className="fit-section fit-dark fit-final" id="fit-start">
        <div className="fit-label">
          <span>FIT® / BƯỚC TIẾP THEO CỦA BẠN</span>
          <ArrowDown size={20} />
        </div>
        <h2>
          Tiềm năng của bạn.
          <br />
          <em>Không giới hạn.</em>
        </h2>
        <div className="fit-final-bottom">
          <p>
            Một hệ sinh thái.
            <br />
            Cho hành trình tập luyện của bạn.
          </p>
          <LandingButton to={ROUTES.public.register}>Bắt đầu tập luyện</LandingButton>
        </div>
      </section>
    </>
  );
}
