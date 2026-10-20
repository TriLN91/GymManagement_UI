import { Check, Clock3, CloudOff, Dumbbell, RefreshCw, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';

import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import type { ExerciseLog } from '../model/workoutFlowTypes';
import { useWorkoutSync } from '../model/workoutSync';

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
  const sync = useWorkoutSync();
  const discard = useWorkoutSessionStore((state) => state.discardSession);
  const session = useWorkoutSessionStore((state) =>
    state.completedSessions.find((item) => item.id === sessionId),
  );
  if (!session) return <Navigate to={ROUTES.member.workoutSchedule} replace />;

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
    if (log.trackingType === 'distance') return `${(log.distanceKm ?? 0).toFixed(2)} km`;
    return `${log.completedRounds} ${t('flow.completion.rounds').toLowerCase()}`;
  };

  const totals = session.totals;
  const status = session.sync.status;

  return (
    <WorkoutFlowShell
      backTo={ROUTES.member.workoutSchedule}
      backLabel={t('flow.completion.weeklySchedule')}
      actions={
        <Link className="workout-flow__primary" to={ROUTES.member.achievements}>
          {t('flow.live.viewProgress')}
        </Link>
      }
    >
      <section className="workout-completion-hero">
        <div>
          <Trophy size={34} />
          <span>{t('flow.completion.completed')}</span>
          <h2>{session.title}</h2>
          <p>
            {new Date(session.completedAt).toLocaleString(i18n.resolvedLanguage ?? i18n.language, {
              timeZone: 'Asia/Ho_Chi_Minh',
            })}
          </p>
        </div>
        <div className="workout-completion-mark">
          <Check size={44} />
        </div>
      </section>

      <section className={`workout-sync-notice is-${status}`} role="status" aria-live="polite">
        <div className={`is-${status}`}>
          {status === 'synced' ? (
            <Check aria-hidden size={16} />
          ) : (
            <CloudOff aria-hidden size={16} />
          )}
          <span>
            {status === 'synced'
              ? t('flow.live.sync.synced')
              : status === 'rejected'
                ? t('flow.live.sync.rejected', { error: session.sync.error ?? '' })
                : t('flow.live.sync.pending')}
          </span>
          {status === 'pending' && (
            <button type="button" onClick={() => void sync()}>
              <RefreshCw aria-hidden size={14} /> {t('flow.live.sync.retry')}
            </button>
          )}
          {status === 'rejected' && (
            <button type="button" onClick={() => discard(session.id)}>
              {t('flow.live.sync.discard')}
            </button>
          )}
        </div>
      </section>

      <section className="workout-completion-metrics">
        {totals.totalVolumeKg > 0 && (
          <div>
            <Dumbbell size={20} />
            <span>{t('flow.completion.trainingVolume')}</span>
            <strong>{totals.totalVolumeKg.toLocaleString()} kg</strong>
          </div>
        )}
        {totals.totalDurationSeconds > 0 && (
          <div>
            <Clock3 size={20} />
            <span>{t('flow.completion.trackedDuration')}</span>
            <strong>{formatDuration(totals.totalDurationSeconds)}</strong>
          </div>
        )}
      </section>

      <section className="workout-completion-breakdown">
        <header>
          <span>{t('flow.completion.actual')}</span>
          <span>
            {t('flow.completion.logged', {
              logged: Object.keys(session.logs).length,
              total: session.exercises.length,
            })}
          </span>
        </header>
        {session.exercises.map((exercise, index) => {
          const log = session.logs[exercise.id];
          return (
            <article key={exercise.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{t(`flow.exercises.${exercise.id}`, { defaultValue: exercise.name })}</h3>
              </div>
              <strong>{log ? logSummary(log) : t('flow.completion.noData')}</strong>
            </article>
          );
        })}
      </section>
    </WorkoutFlowShell>
  );
}
