import { Check, Clock3, Dumbbell, MapPin, Repeat2, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';

import { getWorkoutDay } from '../model/demoWorkoutFlow';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import type { ExerciseLog } from '../model/workoutFlowTypes';

import { WorkoutFlowShell } from './WorkoutFlowShell';

import { ROUTES } from '@/shared/config/constants';

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export function WorkoutCompletion() {
  const { t, i18n } = useTranslation('workout');
  const { sessionId = '' } = useParams();
  const session = useWorkoutSessionStore((state) =>
    state.completedSessions.find((item) => item.id === sessionId),
  );
  if (!session) return <Navigate to={ROUTES.member.workoutSchedule} replace />;
  const day = getWorkoutDay(session.dayId);
  if (!day) return <Navigate to={ROUTES.member.workoutSchedule} replace />;

  const logSummary = (log: ExerciseLog) => {
    if (log.trackingType === 'strength') {
      const completed = log.sets.filter((set) => set.completed);
      const volume = completed.reduce((sum, set) => sum + set.loadKg * set.reps, 0);
      return `${t('flow.completion.sets', { count: completed.length })} · ${t('flow.completion.volume', { value: volume.toLocaleString() })}`;
    }
    if (log.trackingType === 'duration') {
      const completed = log.sets.filter((set) => set.completed);
      return `${t('flow.completion.sets', { count: completed.length })} · ${formatDuration(completed.reduce((sum, set) => sum + set.durationSeconds, 0))}`;
    }
    if (log.trackingType === 'distance') {
      const pace = log.distanceKm > 0 ? log.durationSeconds / log.distanceKm : 0;
      return `${log.distanceKm.toFixed(2)} km · ${formatDuration(log.durationSeconds)} · ${formatDuration(Math.round(pace))}/km`;
    }
    return `${log.completedRounds} ${t('flow.completion.rounds').toLowerCase()} · ${log.workSeconds}s / ${log.restSeconds}s`;
  };

  const totalLogged = Object.keys(session.logs).length;
  const totals = session.totals;
  const metrics = [
    totals.totalVolumeKg > 0
      ? {
          label: t('flow.completion.trainingVolume'),
          value: `${totals.totalVolumeKg.toLocaleString()} kg`,
          icon: Dumbbell,
        }
      : null,
    totals.totalDurationSeconds > 0
      ? {
          label: t('flow.completion.trackedDuration'),
          value: formatDuration(totals.totalDurationSeconds),
          icon: Clock3,
        }
      : null,
    totals.totalDistanceKm > 0
      ? {
          label: t('flow.completion.distance'),
          value: `${totals.totalDistanceKm.toFixed(2)} km`,
          icon: MapPin,
        }
      : null,
    totals.completedRounds > 0
      ? {
          label: t('flow.completion.rounds'),
          value: String(totals.completedRounds),
          icon: Repeat2,
        }
      : null,
  ].filter((metric): metric is NonNullable<typeof metric> => metric !== null);

  return (
    <WorkoutFlowShell
      backTo={ROUTES.member.workoutSchedule}
      backLabel={t('flow.completion.weeklySchedule')}
      actions={
        <Link className="workout-flow__primary" to={ROUTES.member.workout}>
          {t('flow.completion.backPlans')}
        </Link>
      }
    >
      <section className="workout-completion-hero">
        <div>
          <Trophy size={34} />
          <span>{t('flow.completion.completed')}</span>
          <h2>{t(`flow.days.${day.id}`)}</h2>
          <p>
            {new Date(session.completedAt).toLocaleString(i18n.resolvedLanguage ?? i18n.language)}
          </p>
        </div>
        <div className="workout-completion-mark">
          <Check size={44} />
        </div>
      </section>

      {metrics.length > 0 && (
        <section className="workout-completion-metrics">
          {metrics.map(({ label, value, icon: Icon }) => (
            <div key={label}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </section>
      )}

      <section className="workout-completion-breakdown">
        <header>
          <span>{t('flow.completion.actual')}</span>
          <span>
            {t('flow.completion.logged', {
              logged: totalLogged,
              total: day.exercises.length,
            })}
          </span>
        </header>
        {day.exercises.map((exercise, index) => {
          const log = session.logs[exercise.id];
          return (
            <article key={exercise.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{t(`flow.exercises.${exercise.id}`)}</h3>
              </div>
              <strong>{log ? logSummary(log) : t('flow.completion.noData')}</strong>
            </article>
          );
        })}
      </section>
    </WorkoutFlowShell>
  );
}
