import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { lazy, Suspense, useRef } from 'react';

import type { HeroMotion } from '../model/types';
import { useHeroMotion } from '../model/useHeroMotion';

import { LandingButton } from './LandingButton';

import { ROUTES } from '@/shared/config/constants';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

const DumbbellScene = lazy(() =>
  import('./DumbbellScene').then((m) => ({ default: m.DumbbellScene })),
);
function ObjectFallback() {
  return (
    <div className="fit-dumbbell-fallback" role="img" aria-label="Minh họa tạ đôi">
      <span />
      <i />
      <span />
    </div>
  );
}

export function HeroExperience() {
  const root = useRef<HTMLElement>(null);
  const motion = useRef<HeroMotion>({
    progress: 0,
    reveal: 1,
    floatTime: 0,
    invalidate: () => undefined,
  });
  useHeroMotion(root, motion);
  return (
    <section ref={root} className="fit-hero" aria-labelledby="fit-hero-title">
      <div className="fit-hero-stage">
        <div className="fit-hero-top fit-hero-reveal">
          <span className="fit-label">
            <i className="fit-dot" /> TRÍ TUỆ NHÂN TẠO. CHUYỂN ĐỘNG THẬT.
          </span>
          <span className="fit-label">FIT® / DÀNH CHO NGƯỜI TẬP</span>
        </div>
        <div className="fit-hero-title fit-hero-reveal">
          <div className="fit-hero-brand" aria-hidden="true">
            FIT<sup>®</sup>
          </div>
          <h1 id="fit-hero-title">
            Sức mạnh.
            <br />
            Có định hướng.
          </h1>
        </div>
        <div className="fit-object">
          <ErrorBoundary fallback={() => <ObjectFallback />}>
            <Suspense fallback={<ObjectFallback />}>
              <DumbbellScene motion={motion} />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="fit-object-caption fit-label">
          <span>01 — CHUYỂN ĐỘNG</span>
          <span>02 — DỮ LIỆU</span>
          <span>03 — TIẾN BỘ</span>
        </div>
        <div className="fit-tracking" aria-hidden="true">
          <span className="fit-track-corner fit-track-corner--a" />
          <span className="fit-track-corner fit-track-corner--b" />
          <div className="fit-track-label">
            PHÂN TÍCH TƯ THẾ <ArrowUpRight size={14} />
            <strong>
              98.7<span>%</span>
            </strong>
            <small>SỐ LIỆU MINH HỌA</small>
          </div>
        </div>
        <div className="fit-analysis-copy">
          <span className="fit-label">PHÂN TÍCH CHUYỂN ĐỘNG</span>
          <p>
            Mỗi chuyển động.
            <br />
            Một dữ liệu.
          </p>
        </div>
        <div className="fit-hero-bottom fit-hero-reveal">
          <a href="#fit-movement" className="fit-scroll-link">
            <span className="fit-scroll-circle">
              <ArrowDown size={18} />
            </span>{' '}
            Cuộn để khám phá
          </a>
          <p>
            Tập luyện là vận động.
            <br />
            <strong>AI mang đến sự chính xác.</strong>
          </p>
          <LandingButton to={ROUTES.public.register}>Bắt đầu tập luyện</LandingButton>
        </div>
        <div className="fit-scene-line">
          <span className="fit-scene-progress" />
        </div>
      </div>
    </section>
  );
}
