import { Check, Dumbbell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LandingButton } from './LandingButton';
import { Lines } from './Lines';
import { MovementVisual } from './MovementVisual';

import { ROUTES } from '@/shared/config/constants';

interface Feature {
  label: string;
  title: string;
  body: string;
}
interface PreviewRow {
  name: string;
  target: string;
  actual: string;
}

export function MemberSections() {
  const { t } = useTranslation('landing');
  const features = t('m.features', { returnObjects: true }) as Feature[];
  const days = t('m.preview.days', { returnObjects: true }) as string[];
  const rows = t('m.preview.rows', { returnObjects: true }) as PreviewRow[];
  return (
    <>
      <section className="fit-hero" aria-labelledby="fit-hero-title">
        <div className="fit-two-column">
          <div>
            <span className="fit-label">
              <i className="fit-dot" /> {t('m.label')}
            </span>
            <h1 id="fit-hero-title">
              {t('m.title')}
              <br />
              <em>{t('m.titleEm')}</em>
            </h1>
            <p>{t('m.lead')}</p>
            <div className="fit-hero-actions">
              <LandingButton to={ROUTES.public.register}>{t('ctaMember')}</LandingButton>
              <LandingButton to="#fit-features" outline>
                {t('m.explore')}
              </LandingButton>
            </div>
          </div>
          <MovementVisual />
        </div>
      </section>
      <section id="fit-features" className="fit-section">
        <div className="fit-section-heading">
          <h2>
            <Lines text={t('m.featuresTitle')} />
          </h2>
          <p>{t('m.featuresLead')}</p>
        </div>
        <div className="fit-steps">
          {features.map((f) => (
            <article key={f.label}>
              <span className="fit-label">{f.label}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="fit-section fit-soft">
        <div className="fit-two-column">
          <div>
            <h2>
              {t('m.focus')}
              <br />
              <em>{t('m.focusEm')}</em>
            </h2>
            <p>{t('m.focusLead')}</p>
          </div>
          <div className="fit-workout-preview">
            <div className="fit-visual-top fit-label">
              <span>{t('m.preview.top')}</span>
              <span>{t('m.preview.ui')}</span>
            </div>
            <div className="fit-workout-preview-title">
              <h3>
                <Lines text={t('m.preview.title')} />
              </h3>
              <span className="fit-round-icon">
                <Dumbbell size={26} />
              </span>
            </div>
            <div className="fit-days" aria-label={t('m.preview.daysAria')}>
              {days.map((d, i) => (
                <span className={i === 2 ? 'is-selected' : ''} key={d}>
                  {d}
                </span>
              ))}
            </div>
            <div className="fit-prescription-head fit-label">
              <span>{t('m.preview.exercise')}</span>
              <span>{t('m.preview.target')}</span>
              <span>{t('m.preview.actual')}</span>
            </div>
            {rows.map((row, i) => (
              <div key={row.name} className="fit-prescription-row">
                <span>
                  <small>0{i + 1}</small>
                  {row.name}
                </span>
                <span>{row.target}</span>
                <strong>
                  {row.actual}
                  {i === 0 && <Check size={13} />}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="fit-section fit-final">
        <h2>
          {t('m.final')}
          <br />
          <em>{t('m.finalEm')}</em>
        </h2>
        <LandingButton to={ROUTES.public.register}>{t('ctaMember')}</LandingButton>
      </section>
    </>
  );
}
