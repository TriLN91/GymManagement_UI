import { useTranslation } from 'react-i18next';

import type { WorkoutPlanView, WorkoutVersionView } from '../api/types';
import { useWorkoutPlans } from '../model/useLiveWorkout';

import { useLocale } from '@/shared/hooks/useLocale';

function VersionRow({ version, locale }: { version: WorkoutVersionView; locale: string }) {
  const { t } = useTranslation('workout');
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(iso));
  const days = new Set(version.exercises.map((e) => e.dayNumber)).size;
  return (
    <li data-testid="plan-version">
      <strong>{t('myPlans.version', { number: version.versionNumber })}</strong>
      {' · '}
      <span>{t(`myPlans.status.${version.status}`)}</span>
      {' · '}
      <span>
        {fmt(version.effectiveFromUtc)}
        {version.effectiveToUtc ? ` – ${fmt(version.effectiveToUtc)}` : ` – ${t('myPlans.open')}`}
      </span>
      {' · '}
      <span>{t('myPlans.summary', { days, exercises: version.exercises.length })}</span>
    </li>
  );
}

function PlanItem({ plan, locale }: { plan: WorkoutPlanView; locale: string }) {
  const { t } = useTranslation('workout');
  const versions = [...plan.versions].sort((a, b) => b.versionNumber - a.versionNumber);
  return (
    <article data-testid="my-plan" className="workout-plan-card" style={{ padding: 16 }}>
      <h3>{plan.name}</h3>
      <p>
        {t(`myPlans.status.${plan.status}`)}
        {plan.managedByTrainerProfileId ? ` · ${t('myPlans.byTrainer')}` : ''}
      </p>
      <ul>
        {versions.map((version) => (
          <VersionRow key={version.id} version={version} locale={locale} />
        ))}
      </ul>
    </article>
  );
}

/** The Member's real workout plans and their versions from the backend (FR-CF01-04). */
export function MyPlansSection() {
  const { t } = useTranslation('workout');
  const { locale } = useLocale();
  const plans = useWorkoutPlans();

  // This block is additive: while loading or when the request fails the rest of the page still works.
  if (plans.isPending || plans.isError || plans.data.workout.length === 0) return null;

  return (
    <section className="workout-archive" aria-labelledby="my-plans-title">
      <header>
        <h2 id="my-plans-title">{t('myPlans.title')}</h2>
        <span>{t('myPlans.count', { count: plans.data.workout.length })}</span>
      </header>
      <div className="workout-plan-grid">
        {plans.data.workout.map((plan) => (
          <PlanItem key={plan.id} plan={plan} locale={locale} />
        ))}
      </div>
    </section>
  );
}
