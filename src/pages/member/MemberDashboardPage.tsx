import { Activity, Camera } from 'lucide-react';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';

import { PlanCard, useCurrentPlan } from '@/features/coaching';
import {
  calculateProfileReadiness,
  estimateEnergy,
  useProfileSetupStore,
} from '@/features/member-fitness';
import { useWorkoutSessionStore } from '@/features/workout-plans';
import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';

const LABEL = 'text-[10px] font-bold uppercase tracking-widest text-forest/50';
const BADGE =
  'rounded-full border border-forest/20 bg-energy px-2 py-1 text-[9px] font-bold uppercase text-forest';
const CHART_DAYS = 7;
const PLAN_HEADING_ID = 'member-dashboard-plan';

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Volume (kg) per calendar day for the last `CHART_DAYS` days, oldest first. */
function useRecentVolume(locale: string) {
  const sessions = useWorkoutSessionStore((state) => state.completedSessions);
  return useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: CHART_DAYS }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (CHART_DAYS - 1 - index),
      );
      return {
        key: dayKey(date),
        label: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
        volumeKg: 0,
        sessions: 0,
      };
    });
    for (const session of sessions) {
      const day = days.find((item) => item.key === dayKey(new Date(session.completedAt)));
      if (day) {
        day.volumeKg += session.totals.totalVolumeKg;
        day.sessions += 1;
      }
    }
    return days;
  }, [sessions, locale]);
}

function ProfileSummary() {
  const { t } = useTranslation('dashboard');
  const { locale } = useLocale();
  const profile = useProfileSetupStore((state) => state.profile);
  const readiness = useMemo(() => calculateProfileReadiness(profile), [profile]);
  const { identity, goals } = profile;
  const energy = useMemo(() => estimateEnergy(identity), [identity]);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  const goalLabel = goals.selected.length
    ? goals.selected.map((goal) => t(`profile.goals.${goal}`)).join(', ')
    : t('profile.notSet');
  const bodyParts = [
    identity.weightKg ? `${number.format(identity.weightKg)} kg` : null,
    identity.heightCm ? `${number.format(identity.heightCm)} cm` : null,
    readiness.bmi ? `${t('profile.bmi')} ${number.format(readiness.bmi)}` : null,
  ].filter(Boolean);
  const target = goals.targetWeightKg
    ? ` (${t('profile.target')}: ${number.format(goals.targetWeightKg)} kg)`
    : '';

  return (
    <div className="relative flex h-full flex-col rounded-xl border border-forest/20 bg-white p-6 lg:col-span-1">
      <div className="mb-6 flex items-start justify-between">
        <h3 className="font-syne text-xl font-bold leading-none text-forest">
          {t('profile.title')}
        </h3>
        <div className="bg-mint/20 rounded-sm px-2 py-1 text-right text-[10px] font-bold uppercase tracking-widest text-forest">
          {readiness.completeness}% <br />
          {t('profile.complete')}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <div className="border-b border-forest/10 pb-4">
          <div className={`mb-1 ${LABEL}`}>{t('profile.goalLabel')}</div>
          <div className="text-sm font-bold text-forest">{goalLabel}</div>
        </div>

        <div className="border-b border-forest/10 pb-4">
          <div className={`mb-1 ${LABEL}`}>{t('profile.bodyLabel')}</div>
          <div className="text-sm font-bold text-forest">
            {bodyParts.length ? `${bodyParts.join(' · ')}${target}` : t('profile.notSet')}
          </div>
        </div>

        <div className="border-b border-forest/10 pb-4">
          <div className={`mb-1 ${LABEL}`}>{t('profile.energyLabel')}</div>
          <div className="text-sm font-bold text-forest">
            {energy.status === 'ok'
              ? `≈ ${number.format(energy.tdeeKcal)} kcal · BMR ${number.format(energy.reeKcal)} kcal`
              : t('profile.notSet')}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-forest/10 pb-4">
          <div>
            <div className={`mb-1 ${LABEL}`}>{t('profile.healthLabel')}</div>
            <div className="text-sm font-bold text-forest">
              {t(`profile.readiness.${readiness.level}`)}
            </div>
          </div>
          <div className={BADGE}>{readiness.level.replace('_', ' ')}</div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-energy bg-[var(--energy-lime-soft)] p-4">
        <div className="mb-2 flex justify-between text-xs font-bold text-forest">
          <span>{t('profile.completeness')}</span>
          <span>{readiness.completeness}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white">
          <div className="h-full bg-energy" style={{ width: `${readiness.completeness}%` }} />
        </div>
      </div>

      <Button
        asChild
        className="mt-6 h-12 w-full rounded-full bg-forest font-bold text-white hover:bg-forest/90"
      >
        <Link to={ROUTES.member.profileSetup}>{t('profile.edit')}</Link>
      </Button>
    </div>
  );
}

function WeeklyProgress() {
  const { t } = useTranslation('dashboard');
  const { locale } = useLocale();
  const days = useRecentVolume(locale);
  const number = new Intl.NumberFormat(locale);

  const maxVolume = Math.max(...days.map((day) => day.volumeKg), 0);
  const totalVolume = days.reduce((sum, day) => sum + day.volumeKg, 0);
  const totalSessions = days.reduce((sum, day) => sum + day.sessions, 0);
  const points = days.map((day, index) => {
    const x = 5 + (index * 90) / (CHART_DAYS - 1);
    const y = maxVolume ? 90 - (day.volumeKg / maxVolume) * 80 : 90;
    return [x, y] as const;
  });

  return (
    <div className="rounded-xl border border-forest/20 bg-white p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={`mb-1 ${LABEL}`}>{t('progress.tag')}</div>
          <h3 className="font-syne text-2xl font-bold text-forest">{t('progress.title')}</h3>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-8 rounded-full border-forest/20 text-xs font-bold text-forest"
        >
          <Link to={ROUTES.member.workoutHistory}>{t('progress.history')}</Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="border-energy/50 relative flex h-[300px] flex-col overflow-hidden rounded-lg border bg-[var(--energy-lime-faint)] p-6 lg:col-span-2">
          <div className="mb-4 text-xs font-bold text-forest/60">{t('progress.volume')}</div>
          {totalSessions === 0 ? (
            <p className="m-auto max-w-sm text-center text-sm font-medium text-forest/70">
              {t('progress.empty')}
            </p>
          ) : (
            <div className="relative h-full w-full flex-1 border-b border-l border-forest/10 pb-4">
              <svg
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                role="img"
                aria-label={t('progress.volume')}
              >
                <polyline
                  points={points.map(([x, y]) => `${x},${y}`).join(' ')}
                  fill="none"
                  stroke="#345C32"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {points.map(([x, y], index) => (
                  <g key={days[index]?.key}>
                    <circle
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill="#A7F0DD"
                      stroke="#345C32"
                      strokeWidth="0.5"
                    />
                    <text
                      x={x}
                      y="108"
                      fontSize="3"
                      fill="#345C32"
                      opacity="0.5"
                      textAnchor="middle"
                    >
                      {days[index]?.label}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-0 left-[-25px] flex h-full flex-col items-end justify-between pb-4 pt-1 text-[8px] font-medium text-forest/50">
                <span>{number.format(Math.round(maxVolume))}</span>
                <span>0</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex h-[300px] flex-col justify-between gap-4">
          <div className="flex flex-1 flex-col justify-center rounded-lg border border-forest/10 p-4">
            <div className={`mb-2 ${LABEL}`}>{t('progress.sessions')}</div>
            <div className="font-syne text-3xl font-bold text-forest">{totalSessions}</div>
          </div>
          <div className="flex flex-1 flex-col justify-center rounded-lg border border-forest/10 bg-[var(--energy-lime-soft)] p-4">
            <div className={`mb-2 ${LABEL}`}>{t('progress.totalVolume')}</div>
            <div className="font-syne text-3xl font-bold text-forest">
              {number.format(Math.round(totalVolume))}{' '}
              <span className="text-lg font-medium text-forest/50">{t('progress.kg')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { t } = useTranslation('dashboard');
  const { data: plan, isLoading } = useCurrentPlan();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section aria-labelledby={PLAN_HEADING_ID} className="flex flex-col gap-4 lg:col-span-2">
          <PlanCard plan={plan} isLoading={isLoading} headingId={PLAN_HEADING_ID} />
          <div className="flex flex-wrap justify-end gap-3">
            <Button asChild variant="outline" className="rounded-full border-forest/20 font-bold">
              <Link to={ROUTES.member.coaching}>{t('plan.open')}</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-forest px-6 font-bold text-white hover:bg-forest/90"
            >
              <Link to={ROUTES.member.workout}>{t('plan.start')}</Link>
            </Button>
          </div>
        </section>

        <ProfileSummary />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {(
          [
            ['one', Activity, ROUTES.member.workout],
            ['two', Camera, ROUTES.member.aiAssessment],
          ] as const
        ).map(([key, Icon, to]) => (
          <div
            key={key}
            className="group flex flex-col items-center justify-between gap-6 rounded-xl border border-forest/20 bg-white p-6 transition-colors hover:border-mint sm:flex-row sm:items-start"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-forest/20">
              <Icon className="h-5 w-5 text-forest" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className={`mb-2 ${LABEL}`}>{t(`actions.${key}.tag`)}</div>
              <h3 className="mb-2 font-syne text-xl font-bold leading-tight text-forest">
                <Lines text={t(`actions.${key}.title`)} />
              </h3>
              <p className="mx-auto max-w-[200px] text-xs font-medium leading-relaxed text-forest/70 sm:mx-0">
                {t(`actions.${key}.body`)}
              </p>
            </div>
            <Button
              asChild
              className="shrink-0 rounded-full bg-forest px-6 font-bold text-white transition-colors hover:bg-forest/90"
            >
              <Link to={to}>{t(`actions.${key}.cta`)}</Link>
            </Button>
          </div>
        ))}
      </div>

      <WeeklyProgress />
    </div>
  );
}

export function MemberDashboardPage() {
  const profileCompleted = useProfileSetupStore((state) => state.completed);
  // A new Member must finish the fitness profile before seeing the dashboard.
  if (!profileCompleted) return <Navigate to={ROUTES.member.profileSetup} replace />;
  return <DashboardContent />;
}
