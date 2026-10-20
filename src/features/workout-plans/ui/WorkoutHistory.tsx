import { ChevronDown, Clock3, Dumbbell, History } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { serverSessionTotals } from '../model/liveWorkout';
import { useExerciseCatalog, useWorkoutSessions } from '../model/useLiveWorkout';
import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import { useWorkoutSync } from '../model/workoutSync';

import { PendingSyncNotice } from './PendingSyncNotice';
import { WorkoutFlowShell } from './WorkoutFlowShell';

import { ROUTES } from '@/shared/config/constants';

export function WorkoutHistory() {
  const { i18n, t } = useTranslation('workout');
  useWorkoutSync();
  const sessions = useWorkoutSessions();
  const { catalog } = useExerciseCatalog();
  const localCompleted = useWorkoutSessionStore((state) => state.completedSessions);
  const [expanded, setExpanded] = useState<string | null>(null);
  const copy = {
    back: t('workout:workoutHistory.workoutHistory.back'),
    empty: t('workout:workoutHistory.workoutHistory.empty'),
    exercises: t('workout:workoutHistory.workoutHistory.exercises'),
  };

  const localItems = localCompleted.map((session) => ({
    id: session.id,
    title: session.title,
    completedAt: session.completedAt,
    exerciseCount: session.exercises.length,
    totals: {
      volumeKg: session.totals.totalVolumeKg,
      durationSeconds: session.totals.totalDurationSeconds,
      distanceKm: session.totals.totalDistanceKm,
    },
    exercises: session.exercises.map((exercise) => {
      const log = session.logs[exercise.id];
      let logSummary = t('flow.completion.noData');
      if (log) {
        if (log.trackingType === 'strength') {
          const completedSets = log.sets.filter((s) => s.completed);
          logSummary = completedSets.map((s) => `${s.reps} × ${s.loadKg} kg`).join(' · ');
        } else if (log.trackingType === 'duration') {
          const completedSets = log.sets.filter((s) => s.completed);
          logSummary = completedSets.map((s) => `${s.durationSeconds}s`).join(' · ');
        } else if (log.trackingType === 'distance') {
          logSummary = `${(log.distanceKm ?? 0).toFixed(2)} km`;
        } else if (log.trackingType === 'interval') {
          logSummary = `${log.completedRounds} ${t('flow.completion.rounds').toLowerCase()}`;
        }
      }
      return {
        id: exercise.id,
        name: t(`flow.exercises.${exercise.id}`, { defaultValue: exercise.name }),
        logSummary: logSummary || t('flow.completion.noData'),
      };
    }),
  }));

  const serverItems = (sessions.data ?? [])
    .filter(
      (session) =>
        session.status === 'Completed' &&
        !localCompleted.some(
          (local) => local.sync.backendSessionId === session.id || local.id === session.id,
        ),
    )
    .map((session) => {
      const totals = serverSessionTotals(session);
      return {
        id: session.id,
        title: session.workoutPlanVersionId
          ? t('flow.live.planWorkout')
          : t('flow.live.freeTitle'),
        completedAt: session.completedAtUtc ?? session.scheduledAtUtc,
        exerciseCount: session.exercises.length,
        totals: {
          volumeKg: totals.volumeKg,
          durationSeconds: totals.durationSeconds,
          distanceKm: 0,
        },
        exercises: session.exercises.map((exercise) => ({
          id: exercise.id,
          name: catalog.get(exercise.exerciseId)?.name ?? exercise.exerciseId,
          logSummary:
            exercise.logs
              .map((log) =>
                log.repsCompleted !== null
                  ? `${log.repsCompleted} × ${log.weightKg ?? 0} kg`
                  : `${log.durationSeconds ?? 0}s`,
              )
              .join(' · ') || t('flow.completion.noData'),
        })),
      };
    });

  const allCompleted = [...localItems, ...serverItems];

  return (
    <WorkoutFlowShell backTo={ROUTES.member.workoutSchedule} backLabel={copy.back}>
      <PendingSyncNotice />
      {sessions.isPending && allCompleted.length === 0 ? (
        <p className="workout-live-notice" role="status">
          {t('flow.live.loading')}
        </p>
      ) : sessions.isError && allCompleted.length === 0 ? (
        <div className="workout-live-notice" role="alert">
          <span>{t('flow.live.error')}</span>
          <button type="button" onClick={() => void sessions.refetch()}>
            {t('flow.live.retry')}
          </button>
        </div>
      ) : allCompleted.length === 0 ? (
        <section className="workout-history__empty">
          <History size={32} />
          <span>{copy.empty}</span>
        </section>
      ) : (
        <section className="workout-history__list">
          {allCompleted.map((session) => {
            const isOpen = (expanded ?? allCompleted[0]?.id) === session.id;
            return (
              <article key={session.id}>
                <button
                  type="button"
                  className="workout-history__summary"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? '' : session.id)}
                >
                  <div>
                    <span>
                      {new Date(session.completedAt).toLocaleString(
                        i18n.resolvedLanguage ?? i18n.language,
                        { timeZone: 'Asia/Ho_Chi_Minh' },
                      )}
                    </span>
                    <h2>{session.title}</h2>
                    <small>
                      {session.exerciseCount} {copy.exercises}
                    </small>
                  </div>
                  <div className="workout-history__totals">
                    {session.totals.volumeKg > 0 && (
                      <span>
                        <Dumbbell size={13} />
                        {session.totals.volumeKg.toLocaleString()} kg
                      </span>
                    )}
                    {session.totals.durationSeconds > 0 && (
                      <span>
                        <Clock3 size={13} />
                        {Math.round(session.totals.durationSeconds / 60)} min
                      </span>
                    )}
                    <ChevronDown className={isOpen ? 'is-open' : ''} size={18} />
                  </div>
                </button>
                {isOpen && (
                  <div className="workout-history__details">
                    {session.exercises.map((exercise, index) => (
                      <div key={exercise.id}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{exercise.name}</strong>
                        <small>{exercise.logSummary}</small>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </WorkoutFlowShell>
  );
}
