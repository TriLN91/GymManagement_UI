import { Check, Dumbbell } from 'lucide-react';

import { LandingButton } from './LandingButton';
import { MovementVisual } from './MovementVisual';

import { ROUTES } from '@/shared/config/constants';

const FEATURES = [
  [
    '01 / PHÂN TÍCH TƯ THẾ',
    'Hiểu từng chuyển động.',
    'Quay hoặc tải video bài tập. AI chỉ ra điểm cần điều chỉnh theo từng thời điểm.',
  ],
  [
    '02 / GIÁO ÁN',
    'Tập có định hướng.',
    'Theo dõi mục tiêu và kết quả từng hiệp tập trong một lộ trình rõ ràng.',
  ],
  [
    '03 / HUẤN LUYỆN VIÊN',
    'Có người đồng hành.',
    'Chọn huấn luyện viên của phòng tập phù hợp để được điều chỉnh giáo án và theo sát tiến độ.',
  ],
];

export function MemberSections() {
  return (
    <>
      <section className="fit-hero" aria-labelledby="fit-hero-title">
        <div className="fit-two-column">
          <div>
            <span className="fit-label">
              <i className="fit-dot" /> FIT® / DÀNH CHO NGƯỜI TẬP
            </span>
            <h1 id="fit-hero-title">
              Sức mạnh.
              <br />
              <em>Có định hướng.</em>
            </h1>
            <p>
              Phân tích tư thế bằng AI, giáo án rõ ràng và huấn luyện viên đồng hành. Tất cả trong
              một hành trình tập luyện.
            </p>
            <div className="fit-hero-actions">
              <LandingButton to={ROUTES.public.register}>Bắt đầu tập luyện</LandingButton>
              <LandingButton to="#fit-features" outline>
                Khám phá tính năng
              </LandingButton>
            </div>
          </div>
          <MovementVisual />
        </div>
      </section>
      <section id="fit-features" className="fit-section">
        <div className="fit-section-heading">
          <h2>
            Một ứng dụng.
            <br />
            Cả hành trình tập luyện.
          </h2>
          <p>Từ video bài tập đến giáo án và người đồng hành, mọi dữ liệu nằm ở cùng một nơi.</p>
        </div>
        <div className="fit-steps">
          {FEATURES.map(([label, title, body]) => (
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
              Tập trung vào
              <br />
              <em>lần tập tiếp theo.</em>
            </h2>
            <p>
              Biết hôm nay tập gì, bao nhiêu hiệp, và mình đã làm được đến đâu so với mục tiêu.
            </p>
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
                <Dumbbell size={26} />
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
          </div>
        </div>
      </section>
      <section className="fit-section fit-final">
        <h2>
          Tiềm năng của bạn.
          <br />
          <em>Không giới hạn.</em>
        </h2>
        <LandingButton to={ROUTES.public.register}>Bắt đầu tập luyện</LandingButton>
      </section>
    </>
  );
}
