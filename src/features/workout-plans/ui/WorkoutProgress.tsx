import { Activity, CalendarDays, Clock3, Dumbbell, MapPin, Repeat2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { currentWorkoutWeek } from '../model/demoWorkoutFlow';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';

import { WorkoutFlowShell } from './WorkoutFlowShell';

import { ROUTES } from '@/shared/config/constants';

type ProgressMetric = 'volume' | 'duration' | 'distance' | 'rounds';

function getCopy(isVi: boolean) {
  return isVi
    ? {
        title: 'Tiến trình tập luyện',
        back: 'Về lịch tập',
        week: 'Theo dõi tuần này',
        completed: 'Đã hoàn thành',
        planned: 'Đã lên lịch',
        rest: 'Nghỉ',
        data: 'Dữ liệu buổi tập',
        chart: 'Xu hướng theo thời gian',
        volume: 'Tổng tải',
        duration: 'Thời lượng',
        distance: 'Quãng đường',
        rounds: 'Số vòng',
        sessions: 'Buổi đã hoàn thành',
        empty: 'Hoàn thành buổi tập đầu tiên để xem dữ liệu tiến trình.',
      }
    : {
        title: 'Workout progress',
        back: 'Back to schedule',
        week: 'This week tracking',
        completed: 'Completed',
        planned: 'Planned',
        rest: 'Rest',
        data: 'Workout data',
        chart: 'Trend over time',
        volume: 'Training volume',
        duration: 'Duration',
        distance: 'Distance',
        rounds: 'Rounds',
        sessions: 'Completed sessions',
        empty: 'Complete your first workout to see progress data.',
      };
}

export function WorkoutProgress() {
  const { i18n, t } = useTranslation('workout');
  const copy = getCopy(i18n.resolvedLanguage === 'vi');
  const sessions = useWorkoutSessionStore((state) => state.completedSessions);
  const [metric, setMetric] = useState<ProgressMetric>('volume');
  const completedDayIds = new Set(sessions.map((session) => session.dayId));
  const metricConfig = {
    volume: {
      label: copy.volume,
      icon: Dumbbell,
      value: (index: number) => sessions[index]?.totals.totalVolumeKg ?? 0,
      suffix: 'kg',
    },
    duration: {
      label: copy.duration,
      icon: Clock3,
      value: (index: number) =>
        Math.round((sessions[index]?.totals.totalDurationSeconds ?? 0) / 60),
      suffix: 'min',
    },
    distance: {
      label: copy.distance,
      icon: MapPin,
      value: (index: number) => sessions[index]?.totals.totalDistanceKm ?? 0,
      suffix: 'km',
    },
    rounds: {
      label: copy.rounds,
      icon: Repeat2,
      value: (index: number) => sessions[index]?.totals.completedRounds ?? 0,
      suffix: '',
    },
  } as const;
  const values = sessions
    .slice(0, 8)
    .map((_, index) => metricConfig[metric].value(index))
    .reverse();
  const maxValue = Math.max(1, ...values);
  const totals = sessions.reduce(
    (result, session) => ({
      volume: result.volume + session.totals.totalVolumeKg,
      duration: result.duration + session.totals.totalDurationSeconds,
      distance: result.distance + session.totals.totalDistanceKm,
      rounds: result.rounds + session.totals.completedRounds,
    }),
    { volume: 0, duration: 0, distance: 0, rounds: 0 },
  );

  return (
    <WorkoutFlowShell backTo={ROUTES.member.workoutSchedule} backLabel={copy.back}>
      <section className="workout-progress__week">
        <header>
          <CalendarDays size={19} />
          <h2>{copy.week}</h2>
        </header>
        <div>
          {currentWorkoutWeek.map((day) => {
            const status =
              completedDayIds.has(day.id) || day.status === 'completed'
                ? 'completed'
                : day.status === 'rest'
                  ? 'rest'
                  : 'planned';
            return (
              <article className={`is-${status}`} key={day.id}>
                <span>{t(`flow.weekdays.${day.weekday.toLowerCase()}`)}</span>
                <strong>{String(day.dayNumber).padStart(2, '0')}</strong>
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
            <strong>{sessions.length}</strong>
          </article>
          <article>
            <span>{copy.volume}</span>
            <strong>{totals.volume.toLocaleString()} kg</strong>
          </article>
          <article>
            <span>{copy.duration}</span>
            <strong>{Math.round(totals.duration / 60)} min</strong>
          </article>
          <article>
            <span>{copy.distance}</span>
            <strong>{totals.distance.toFixed(1)} km</strong>
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
