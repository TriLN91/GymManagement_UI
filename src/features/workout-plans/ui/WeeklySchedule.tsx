import { Check, ChevronRight, Clock3, Dumbbell, MoonStar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { currentWorkoutWeek } from '../model/demoWorkoutFlow';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';

import { WorkoutFlowShell } from './WorkoutFlowShell';

import {
  type Weekday,
  useMemberWorkoutBuilderStore,
} from '@/features/member-workout-builder/model/useMemberWorkoutBuilderStore';
import { ROUTES } from '@/shared/config/constants';

export function WeeklySchedule() {
  const { t } = useTranslation('workout');
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  const completedSessions = useWorkoutSessionStore((state) => state.completedSessions);
  const savedPlans = useMemberWorkoutBuilderStore((state) => state.savedPlans);
  const optionalAddons = useMemberWorkoutBuilderStore((state) => state.optionalAddons);
  const completedDayIds = new Set(completedSessions.map((session) => session.dayId));
  const completedDays = currentWorkoutWeek.filter(
    (day) => day.status === 'completed' || completedDayIds.has(day.id),
  ).length;
  const workoutDays = currentWorkoutWeek.filter((day) => day.status !== 'rest').length;
  const completion = Math.round((completedDays / workoutDays) * 100);

  return (
    <WorkoutFlowShell backTo={ROUTES.member.workout} backLabel={t('flow.backToPlans')}>
      <section className="workout-week-summary" aria-label={t('flow.schedule.summary')}>
        <div>
          <span>{t('flow.schedule.week')}</span>
          <strong>{t('flow.schedule.weekRange')}</strong>
        </div>
        <div>
          <span>{t('flow.schedule.trainingDays')}</span>
          <strong>{workoutDays}/7</strong>
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
        {currentWorkoutWeek.map((day) => {
          const dayKey = day.weekday.toLowerCase() as Weekday;
          const personalExercises = savedPlans.flatMap((plan) =>
            plan.exercises
              .filter((exercise) => exercise.days.includes(dayKey))
              .map((exercise) => ({ planName: plan.name, exerciseId: exercise.exerciseId })),
          );
          const optionalExercises = optionalAddons.flatMap((addon) =>
            addon.exercises
              .filter((exercise) => exercise.days.includes(dayKey))
              .map((exercise) => ({ addonName: addon.name, exerciseId: exercise.exerciseId })),
          );
          const canOpen = day.exercises.length > 0 || optionalExercises.length > 0;
          const isActive = activeSession?.dayId === day.id;
          const status = completedDayIds.has(day.id) ? 'completed' : day.status;
          const content = (
            <>
              <div className="workout-day-card__top">
                <span>{t(`flow.weekdays.${day.weekday.toLowerCase()}`)}</span>
                <strong>{t(`flow.dates.${day.id}`)}</strong>
              </div>
              <div className="workout-day-card__icon">
                {status === 'completed' ? (
                  <Check />
                ) : status === 'rest' ? (
                  <MoonStar />
                ) : (
                  <Dumbbell />
                )}
              </div>
              <div>
                <h2>{t(`flow.days.${day.id}`)}</h2>
              </div>
              <div className="workout-day-card__meta">
                {day.durationMinutes > 0 && (
                  <span>
                    <Clock3 size={13} /> {day.durationMinutes} {t('metrics.minutes')}
                  </span>
                )}
                {canOpen && (
                  <span>
                    {isActive ? t('flow.schedule.resume') : t('flow.schedule.view')}{' '}
                    <ChevronRight size={14} />
                  </span>
                )}
                {personalExercises.length > 0 && (
                  <span>
                    {personalExercises.length} {t('metrics.exercises')} ·{' '}
                    {personalExercises[0]?.planName}
                  </span>
                )}
                {optionalExercises.length > 0 && (
                  <span className="is-optional">
                    {t('flow.schedule.optionalCount', { count: optionalExercises.length })} ·{' '}
                    {optionalExercises[0]?.addonName}
                  </span>
                )}
              </div>
            </>
          );

          if (!canOpen) {
            return (
              <article className={`workout-day-card is-${status}`} key={day.id}>
                {content}
              </article>
            );
          }

          return (
            <Link
              className={`workout-day-card is-${status}`}
              to={ROUTES.member.workoutDayPath(day.id)}
              key={day.id}
            >
              {content}
            </Link>
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
    </WorkoutFlowShell>
  );
}
