import { Check, ChevronRight, Clock3, Dumbbell, MoonStar, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { optionalExercisesFor } from '../model/optionalAddons';
import { useLiveWorkoutWeek } from '../model/useLiveWorkout';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import { useWorkoutSync } from '../model/workoutSync';

import { PendingSyncNotice } from './PendingSyncNotice';
import { WorkoutFlowShell } from './WorkoutFlowShell';

import { formatBusinessDate } from '@/features/gamification/model/presentation';
import { useMemberWorkoutBuilderStore } from '@/features/member-workout-builder/model/useMemberWorkoutBuilderStore';
import { ROUTES } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';

export function WeeklySchedule() {
  const { t } = useTranslation('workout');
  const { locale } = useLocale();
  useWorkoutSync();
  const live = useLiveWorkoutWeek();
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  const optionalAddons = useMemberWorkoutBuilderStore((state) => state.optionalAddons);

  if (live.isPending)
    return (
      <WorkoutFlowShell backTo={ROUTES.member.workout} backLabel={t('flow.backToPlans')}>
        <p className="workout-live-notice" role="status">
          {t('flow.live.loading')}
        </p>
      </WorkoutFlowShell>
    );
  if (live.isError)
    return (
      <WorkoutFlowShell backTo={ROUTES.member.workout} backLabel={t('flow.backToPlans')}>
        <div className="workout-live-notice" role="alert">
          <span>{t('flow.live.error')}</span>
          <button type="button" onClick={() => void live.refetch()}>
            {t('flow.live.retry')}
          </button>
        </div>
      </WorkoutFlowShell>
    );

  const trainingDays = live.week.filter((day) => day.dayNumber !== null).length;
  const completedDays = live.week.filter((day) => day.status === 'completed').length;
  const completion = trainingDays === 0 ? 0 : Math.round((completedDays / trainingDays) * 100);
  const first = live.week[0];
  const last = live.week.at(-1);

  return (
    <WorkoutFlowShell
      backTo={ROUTES.member.workout}
      backLabel={t('flow.backToPlans')}
      actions={
        <Link className="workout-flow__primary" to={ROUTES.member.workoutDayPath('free')}>
          <Plus size={16} /> {t('flow.live.freeWorkout')}
        </Link>
      }
    >
      <PendingSyncNotice />
      {!live.hasActivePlan && <p className="workout-live-notice">{t('flow.live.noPlan')}</p>}
      {live.hasActivePlan && !live.scheduleConfigured && (
        <p className="workout-live-notice">
          {t('flow.live.noSchedule')}{' '}
          <Link to={ROUTES.member.achievements}>{t('flow.live.setDays')}</Link>
        </p>
      )}
      <section className="workout-week-summary" aria-label={t('flow.schedule.summary')}>
        <div>
          <span>{t('flow.schedule.week')}</span>
          <strong>
            {first && last
              ? `${formatBusinessDate(first.id, locale)} — ${formatBusinessDate(last.id, locale)}`
              : '—'}
          </strong>
        </div>
        <div>
          <span>{t('flow.schedule.trainingDays')}</span>
          <strong>{trainingDays}/7</strong>
        </div>
        <div>
          <span>{t('flow.schedule.completed')}</span>
          <strong>{completedDays}</strong>
        </div>
        <div>
          <span>{t('flow.schedule.weekProgress')}</span>
          <strong>{completion}%</strong>
          <div className="workout-flow__progress">
            <span style={{ width: `${completion}%` }} />
          </div>
        </div>
      </section>

      <section className="workout-week-grid" aria-label={t('flow.schedule.title')}>
        {live.week.map((day) => {
          const optional = optionalExercisesFor(optionalAddons, day.weekday);
          const canOpenMain = day.isToday && day.status === 'ready' && day.exercises.length > 0;
          const canOpen = canOpenMain || optional.length > 0;
          const isActive = activeSession?.dayId === day.id;
          const content = (
            <>
              <div className="workout-day-card__top">
                <span>{t(`flow.weekdays.${day.weekday}`)}</span>
                <strong>{formatBusinessDate(day.id, locale)}</strong>
              </div>
              <div className="workout-day-card__icon">
                {day.status === 'completed' ? (
                  <Check />
                ) : day.status === 'rest' || day.status === 'paused' ? (
                  <MoonStar />
                ) : (
                  <Dumbbell />
                )}
              </div>
              <div>
                <h2>
                  {day.dayNumber !== null
                    ? t('flow.live.day', { day: day.dayNumber })
                    : t(`flow.live.status.${day.status}`)}
                </h2>
                {day.dayNumber !== null && <small>{t(`flow.live.status.${day.status}`)}</small>}
              </div>
              <div className="workout-day-card__meta">
                {day.durationMinutes > 0 && (
                  <span>
                    <Clock3 size={13} /> {day.durationMinutes} {t('metrics.minutes')}
                  </span>
                )}
                {day.exercises.length > 0 && (
                  <span>
                    {day.exercises.length} {t('metrics.exercises')}
                  </span>
                )}
                {optional.length > 0 && (
                  <span className="is-optional">
                    {t('flow.schedule.optionalCount', { count: optional.length })} ·{' '}
                    {optional[0]?.addon.name}
                  </span>
                )}
                {canOpen && (
                  <span>
                    {isActive && canOpenMain ? t('flow.schedule.resume') : t('flow.schedule.view')}{' '}
                    <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </>
          );
          const className = `workout-day-card is-${day.status}${day.isToday ? ' is-today' : ''}`;
          return canOpen ? (
            <Link className={className} to={ROUTES.member.workoutDayPath(day.id)} key={day.id}>
              {content}
            </Link>
          ) : (
            <article
              className={className}
              key={day.id}
              aria-current={day.isToday ? 'date' : undefined}
            >
              {content}
            </article>
          );
        })}
      </section>
      {optionalAddons.length > 0 && (
        <section className="workout-optional-addons" aria-label={t('flow.schedule.optionalTitle')}>
          <header>
            <span>{t('flow.schedule.optionalTitle')}</span>
            <strong>{optionalAddons.length}</strong>
          </header>
          {optionalAddons.map((addon) => (
            <article key={addon.id}>
              <div>
                <strong>{addon.name}</strong>
                <span>{addon.sourcePlanName}</span>
              </div>
              <b>{t('flow.schedule.optionalProtected')}</b>
            </article>
          ))}
        </section>
      )}
      <p className="workout-live-notice is-quiet">{t('flow.schedule.note')}</p>
    </WorkoutFlowShell>
  );
}
