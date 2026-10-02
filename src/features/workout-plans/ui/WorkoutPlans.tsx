import {
  Activity,
  CircleAlert,
  Clock3,
  Dumbbell,
  Layers3,
  LockKeyhole,
  PackageOpen,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { demoWorkoutPlans, featuredWorkout } from '../model/demoWorkoutPlans';
import type { WorkoutPlanPreview, WorkoutPlansViewState } from '../model/types';

import './workout-plans.css';

import { ROUTES } from '@/shared/config/constants';

interface WorkoutPlansProps {
  state?: WorkoutPlansViewState;
  plans?: ReadonlyArray<WorkoutPlanPreview>;
  onRetry?: () => void;
}

function WorkoutPlansSkeleton() {
  return (
    <div className="workout-skeleton" aria-label="Loading workout plans" aria-busy="true">
      <div className="workout-skeleton__heading" />
      <div className="workout-skeleton__featured" />
      <div className="workout-skeleton__grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="workout-skeleton__card" key={index} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: WorkoutPlanPreview }) {
  const { t } = useTranslation('workout');
  const statusText =
    plan.status === 'completed'
      ? t('status.completed', { progress: plan.progress })
      : plan.status === 'active'
        ? t('status.active', { progress: plan.progress })
        : t('status.ready');
  const progressText =
    plan.status === 'completed'
      ? t('status.complete')
      : plan.status === 'active'
        ? t('status.sets', { completed: plan.completedSets, total: plan.totalSets })
        : t('status.notStarted');
  const actionLabel =
    plan.status === 'completed'
      ? t('actions.restart')
      : plan.status === 'active'
        ? t('actions.resume')
        : t('actions.start');

  return (
    <article className="workout-plan-card">
      <div className="workout-plan-card__meta">
        <div>
          <span className="workout-code">{plan.code}</span>
          <span className="workout-plan-card__level">{t(`levels.${plan.level}`)}</span>
        </div>
        <span className={`workout-status workout-status--${plan.status}`}>{statusText}</span>
      </div>

      <div className="workout-plan-card__copy">
        <h3>{t(`plans.${plan.id}.title`)}</h3>
      </div>

      <dl className="workout-plan-card__metrics">
        <div>
          <dt>
            <Layers3 aria-hidden="true" size={15} />
            {t('metrics.exercises')}
          </dt>
          <dd>
            {String(plan.stations).padStart(2, '0')} {t('metrics.stations')}
          </dd>
        </div>
        <div>
          <dt>
            <Clock3 aria-hidden="true" size={15} />
            {t('metrics.duration')}
          </dt>
          <dd>
            {plan.durationMinutes} {t('metrics.minutes')}
          </dd>
        </div>
        <div className="workout-plan-card__apparatus">
          <dt>
            <Dumbbell aria-hidden="true" size={15} />
            {t('metrics.apparatus')}
          </dt>
          <dd>{plan.apparatus}</dd>
        </div>
      </dl>

      <div className="workout-plan-card__footer">
        <div className="workout-card-progress">
          <div className="workout-card-progress__label">
            <span>{progressText}</span>
            <strong>{plan.progress}%</strong>
          </div>
          <div
            className="workout-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={plan.progress}
          >
            <span style={{ width: `${plan.progress}%` }} />
          </div>
        </div>
        <button
          className="workout-card-action"
          type="button"
          disabled
          title={t('actions.unavailable')}
        >
          <span>{actionLabel}</span>
          <LockKeyhole aria-hidden="true" size={14} />
        </button>
      </div>
    </article>
  );
}

export function WorkoutPlans({
  state = 'loaded',
  plans = demoWorkoutPlans,
  onRetry,
}: WorkoutPlansProps) {
  const { t } = useTranslation('workout');
  if (state === 'loading') return <WorkoutPlansSkeleton />;

  if (state === 'error') {
    return (
      <section className="workout-state" role="alert">
        <CircleAlert aria-hidden="true" size={32} strokeWidth={1.5} />
        <h1>{t('states.errorTitle')}</h1>
        <p>{t('states.errorDescription')}</p>
        <button type="button" onClick={onRetry}>
          <RefreshCw aria-hidden="true" size={16} />
          {t('states.retry')}
        </button>
      </section>
    );
  }

  if (state === 'empty' || plans.length === 0) {
    return (
      <section className="workout-state">
        <PackageOpen aria-hidden="true" size={34} strokeWidth={1.5} />
        <h1>{t('states.emptyTitle')}</h1>
        <p>{t('states.emptyDescription')}</p>
      </section>
    );
  }

  return (
    <div className="workout-plans">
      <section className="workout-featured" aria-labelledby="featured-workout-title">
        <div className="workout-featured__topline">
          <div>
            <span className="workout-live-dot" aria-hidden="true" />
            <strong>{t('featured.label')}</strong>
            <span className="workout-status workout-status--active">{t('featured.status')}</span>
          </div>
          <span>
            {t('featured.cycle')}: {featuredWorkout.code}
          </span>
        </div>

        <div className="workout-featured__grid">
          <div className="workout-featured__media">
            <svg
              className="workout-featured__art"
              viewBox="0 0 520 640"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="workout-art-bg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#dff4a0" />
                  <stop offset="0.52" stopColor="#345c32" />
                  <stop offset="1" stopColor="#102f1d" />
                </linearGradient>
                <pattern id="workout-art-grid" width="34" height="34" patternUnits="userSpaceOnUse">
                  <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#f5ffc2" strokeOpacity=".16" />
                </pattern>
                <linearGradient id="workout-art-body" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f5ffc2" />
                  <stop offset="1" stopColor="#a7f0dd" />
                </linearGradient>
              </defs>
              <rect width="520" height="640" fill="url(#workout-art-bg)" />
              <rect width="520" height="640" fill="url(#workout-art-grid)" />
              <circle cx="410" cy="120" r="126" fill="none" stroke="#a7f0dd" strokeOpacity=".36" />
              <circle cx="410" cy="120" r="76" fill="none" stroke="#f5ffc2" strokeOpacity=".34" />
              <path
                d="M124 468C138 362 176 298 237 276c52-18 117 1 146 51 24 41 29 89 31 141Z"
                fill="url(#workout-art-body)"
                fillOpacity=".92"
              />
              <circle cx="266" cy="212" r="58" fill="#f5ffc2" />
              <path
                d="M180 324c-52 17-95 52-122 102M350 329c58 13 102 45 132 96"
                fill="none"
                stroke="#a7f0dd"
                strokeWidth="34"
                strokeLinecap="round"
              />
              <path d="M70 250 450 176" stroke="#f5ffc2" strokeWidth="14" strokeLinecap="round" />
              <g fill="#173917" stroke="#a7f0dd" strokeWidth="5">
                <rect
                  x="46"
                  y="204"
                  width="34"
                  height="100"
                  rx="6"
                  transform="rotate(-11 63 254)"
                />
                <rect x="84" y="216" width="23" height="76" rx="5" transform="rotate(-11 95 254)" />
                <rect
                  x="421"
                  y="137"
                  width="34"
                  height="100"
                  rx="6"
                  transform="rotate(-11 438 187)"
                />
                <rect
                  x="393"
                  y="149"
                  width="23"
                  height="76"
                  rx="5"
                  transform="rotate(-11 404 187)"
                />
              </g>
              <path d="M98 540h324" stroke="#a7f0dd" strokeOpacity=".64" />
              <path d="M98 562h220" stroke="#f5ffc2" strokeOpacity=".52" />
              <circle cx="98" cy="540" r="6" fill="#f5ffc2" />
            </svg>
            <div className="workout-featured__media-tint" />
            <span className="workout-featured__preview">
              <Activity aria-hidden="true" size={14} />
              {t('featured.preview')}
            </span>
            <div className="workout-featured__target">
              <span>{t('featured.targetLabel')}</span>
              <strong>{t('featured.target')}</strong>
            </div>
          </div>

          <div className="workout-featured__content">
            <div className="workout-featured__copy">
              <h2 id="featured-workout-title">{t('featured.title')}</h2>
            </div>

            <dl className="workout-featured__metrics">
              <div>
                <dt>{t('metrics.exercises')}</dt>
                <dd>
                  {String(featuredWorkout.stations).padStart(2, '0')}
                  <small>{t('metrics.stations')}</small>
                </dd>
              </div>
              <div>
                <dt>{t('metrics.targetTime')}</dt>
                <dd>
                  {featuredWorkout.durationMinutes}
                  <small>{t('metrics.minutes')}</small>
                </dd>
              </div>
              <div>
                <dt>{t('metrics.expenditure')}</dt>
                <dd>
                  ~{featuredWorkout.calories}
                  <small>{t('metrics.calories')}</small>
                </dd>
              </div>
              <div>
                <dt>{t('metrics.cycleTier')}</dt>
                <dd className="workout-featured__tier">{featuredWorkout.tier}</dd>
              </div>
            </dl>

            <div className="workout-featured__footer">
              <div className="workout-featured__progress">
                <div>
                  <span>
                    {t('featured.progress', {
                      completed: featuredWorkout.completedSets,
                      total: featuredWorkout.totalSets,
                    })}
                  </span>
                  <strong>{featuredWorkout.progress}%</strong>
                </div>
                <div
                  className="workout-progress workout-progress--large"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={featuredWorkout.progress}
                >
                  <span style={{ width: `${featuredWorkout.progress}%` }} />
                </div>
              </div>
              <Link className="workout-action" to={ROUTES.member.workoutSchedule}>
                <span>{t('actions.continue')}</span>
                <Activity aria-hidden="true" size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="workout-archive" aria-labelledby="workout-archive-title">
        <header>
          <div>
            <PackageOpen aria-hidden="true" size={20} />
            <h2 id="workout-archive-title">{t('archive.title')}</h2>
            <span>{t('archive.count', { count: plans.length })}</span>
          </div>
          <span>{t('archive.sort')}</span>
        </header>

        <div className="workout-plan-grid">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </div>
  );
}
