import { Activity, CalendarDays, Clock3, Dumbbell } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { serverSessionTotals } from '../model/liveWorkout';
import { useLiveWorkoutWeek, useWorkoutSessions } from '../model/useLiveWorkout';

import { WorkoutFlowShell } from './WorkoutFlowShell';

import { ROUTES } from '@/shared/config/constants';

type ProgressMetric = 'volume' | 'duration';

export function WorkoutProgress() {
  const { t } = useTranslation('workout');
  const live = useLiveWorkoutWeek();
  const sessionsQuery = useWorkoutSessions();
  const [metric, setMetric] = useState<ProgressMetric>('volume');
  const copy = {
    back: t('workout:workoutProgress.copy.back'),
    week: t('workout:workoutProgress.copy.week'),
    completed: t('workout:workoutProgress.copy.completed'),
    planned: t('workout:workoutProgress.copy.planned'),
    rest: t('workout:workoutProgress.copy.rest'),
    data: t('workout:workoutProgress.copy.data'),
    chart: t('workout:workoutProgress.copy.chart'),
    volume: t('workout:workoutProgress.copy.volume'),
    duration: t('workout:workoutProgress.copy.duration'),
    sessions: t('workout:workoutProgress.copy.sessions'),
    empty: t('workout:workoutProgress.copy.empty'),
  };
  const sessions = (sessionsQuery.data ?? [])
    .filter((session) => session.status === 'Completed')
    .map((session) => serverSessionTotals(session));
  const metricConfig = {
    volume: {
      label: copy.volume,
      icon: Dumbbell,
      value: (i: number) => sessions[i]?.volumeKg ?? 0,
      suffix: 'kg',
    },
    duration: {
      label: copy.duration,
      icon: Clock3,
      value: (i: number) => Math.round((sessions[i]?.durationSeconds ?? 0) / 60),
      suffix: 'min',
    },
  } as const;
  const values = sessions
    .slice(0, 8)
    .map((_, index) => metricConfig[metric].value(index))
    .reverse();
  const maxValue = Math.max(1, ...values);
  const totals = sessions.reduce(
    (result, session) => ({
      volume: result.volume + session.volumeKg,
      duration: result.duration + session.durationSeconds,
    }),
    { volume: 0, duration: 0 },
  );

  return (
    <WorkoutFlowShell backTo={ROUTES.member.workoutSchedule} backLabel={copy.back}>
      {(live.isError || sessionsQuery.isError) && (
        <p className="workout-live-notice" role="alert">
          {t('flow.live.error')}
        </p>
      )}
      <section className="workout-progress__week">
        <header>
          <CalendarDays size={19} />
          <h2>{copy.week}</h2>
        </header>
        <div>
          {live.week.map((day) => {
            const status =
              day.status === 'completed'
                ? 'completed'
                : day.status === 'rest' || day.status === 'paused'
                  ? 'rest'
                  : 'planned';
            return (
              <article className={`is-${status}`} key={day.id}>
                <span>{t(`flow.weekdays.${day.weekday}`)}</span>
                <strong>
                  {day.dayNumber !== null ? String(day.dayNumber).padStart(2, '0') : '—'}
                </strong>
                <small>
                  {status === 'completed'
                    ? copy.completed
                    : status === 'rest'
                      ? copy.rest
                      : copy.planned}
                </small>
              </article>
            );
          })}
        </div>
      </section>

      <section className="workout-progress__metrics">
        <header>
          <Activity size={19} />
          <h2>{copy.data}</h2>
        </header>
        <div>
          <article>
            <span>{copy.sessions}</span>
            <strong>{sessionsQuery.isPending ? '…' : sessions.length}</strong>
          </article>
          <article>
            <span>{copy.volume}</span>
            <strong>{totals.volume.toLocaleString()} kg</strong>
          </article>
          <article>
            <span>{copy.duration}</span>
            <strong>{Math.round(totals.duration / 60)} min</strong>
          </article>
        </div>
      </section>

      <section className="workout-progress__chart">
        <header>
          <h2>{copy.chart}</h2>
          <div>
            {(Object.keys(metricConfig) as ProgressMetric[]).map((key) => {
              const Icon = metricConfig[key].icon;
              return (
                <button
                  type="button"
                  className={metric === key ? 'is-active' : ''}
                  onClick={() => setMetric(key)}
                  key={key}
                >
                  <Icon size={14} />
                  {metricConfig[key].label}
                </button>
              );
            })}
          </div>
        </header>
        {values.length === 0 ? (
          <div className="workout-progress__empty">
            <Activity size={28} />
            <span>{copy.empty}</span>
          </div>
        ) : (
          <div className="workout-progress__bars" aria-label={metricConfig[metric].label}>
            {values.map((value, index) => (
              <div key={index}>
                <span style={{ height: `${Math.max(4, (value / maxValue) * 100)}%` }} />
                <strong>
                  {value.toLocaleString()} {metricConfig[metric].suffix}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </WorkoutFlowShell>
  );
}
