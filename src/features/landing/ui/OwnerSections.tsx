import { useTranslation } from 'react-i18next';

import { LandingButton } from './LandingButton';
import { Lines } from './Lines';

import { ROUTES } from '@/shared/config/constants';

interface Step {
  label: string;
  title: string;
  body: string;
}
interface OfferRow {
  title: string;
  body: string;
}

export function OwnerSections() {
  const { t } = useTranslation('landing');
  const steps = t('o.steps', { returnObjects: true }) as Step[];
  const tags = t('o.tags', { returnObjects: true }) as string[];
  const offerRows = t('o.offerRows', { returnObjects: true }) as OfferRow[];
  return (
    <>
      <section className="fit-hero" aria-labelledby="fit-owner-title">
        <div className="fit-two-column">
          <div>
            <span className="fit-label">
              <i className="fit-dot" /> {t('o.label')}
            </span>
            <h1 id="fit-owner-title">
              {t('o.title')}
              <br />
              <em>{t('o.titleEm')}</em>
            </h1>
            <p>{t('o.lead')}</p>
            <div className="fit-hero-actions">
              <LandingButton to={ROUTES.public.register}>{t('ctaOwner')}</LandingButton>
            </div>
          </div>
          <div className="fit-owner-visual" aria-label={t('o.visualAria')}>
            <div className="fit-label fit-visual-top">
              <span>{t('o.visualTop')}</span>
              <span>{t('o.illustration')}</span>
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
                <Lines text={t('o.found')} />
              </h3>
              <div>
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="fit-section">
        <div className="fit-section-heading">
          <h2>
            <Lines text={t('o.stepsTitle')} />
          </h2>
          <p>{t('o.stepsLead')}</p>
        </div>
        <div className="fit-steps">
          {steps.map((step) => (
            <article key={step.label}>
              <span className="fit-label">{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="fit-section fit-soft">
        <div className="fit-two-column">
          <div>
            <h2>
              {t('o.offerTitle')}
              <br />
              <em>{t('o.offerTitleEm')}</em>
            </h2>
            <p>{t('o.offerLead')}</p>
            <p className="fit-footnote">{t('o.commission')}</p>
          </div>
          <div className="fit-offer-visual">
            <span className="fit-label">{t('o.offerLabel')}</span>
            {offerRows.map((row, i) => (
              <div className="fit-offer-row" key={row.title}>
                <span className="fit-label">0{i + 1}</span>
                <strong>{row.title}</strong>
                <span>{row.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="fit-section fit-final">
        <h2>
          {t('o.final')}
          <br />
          <em>{t('o.finalEm')}</em>
        </h2>
        <LandingButton to={ROUTES.public.register}>{t('ctaOwner')}</LandingButton>
      </section>
    </>
  );
}
