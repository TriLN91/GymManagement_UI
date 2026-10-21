import { ChevronDown, Clock3, Dumbbell, History } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { serverSessionTotals } from '../model/liveWorkout';
import { canCorrect } from '../model/sessionCorrection';
import { useExerciseCatalog, useWorkoutSessions } from '../model/useLiveWorkout';
import { useWorkoutSync } from '../model/workoutSync';

import { PendingSyncNotice } from './PendingSyncNotice';
import { SessionCorrectionForm } from './SessionCorrectionForm';
import { WorkoutFlowShell } from './WorkoutFlowShell';

import { ROUTES } from '@/shared/config/constants';

export function WorkoutHistory() {
  const { i18n, t } = useTranslation('workout');
  useWorkoutSync();
  const sessions = useWorkoutSessions();
  const { catalog } = useExerciseCatalog();
  const completed = (sessions.data ?? []).filter((session) => session.status === 'Completed');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const copy = {
    back: t('workout:workoutHistory.workoutHistory.back'),
    empty: t('workout:workoutHistory.workoutHistory.empty'),
    exercises: t('workout:workoutHistory.workoutHistory.exercises'),
  };

  return (
    <WorkoutFlowShell backTo={ROUTES.member.workoutSchedule} backLabel={copy.back}>
      <PendingSyncNotice />
      {sessions.isPending ? (
        <p className="workout-live-notice" role="status">
          {t('flow.live.loading')}
        </p>
      ) : sessions.isError ? (
        <div className="workout-live-notice" role="alert">
          <span>{t('flow.live.error')}</span>
          <button type="button" onClick={() => void sessions.refetch()}>
            {t('flow.live.retry')}
          </button>
        </div>
      ) : completed.length === 0 ? (
        <section className="workout-history__empty">
          <History size={32} />
          <span>{copy.empty}</span>
        </section>
      ) : (
        <section className="workout-history__list">
          {completed.map((session) => {
            const totals = serverSessionTotals(session);
            const isOpen = (expanded ?? completed[0]?.id) === session.id;
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
                      {new Date(session.completedAtUtc ?? session.scheduledAtUtc).toLocaleString(
                        i18n.resolvedLanguage ?? i18n.language,
                        { timeZone: 'Asia/Ho_Chi_Minh' },
                      )}
                    </span>
                    <h2>
                      {session.workoutPlanVersionId
                        ? t('flow.live.planWorkout')
                        : t('flow.live.freeTitle')}
                    </h2>
                    <small>
                      {session.exercises.length} {copy.exercises}
                    </small>
                  </div>
                  <div className="workout-history__totals">
                    {totals.volumeKg > 0 && (
                      <span>
                        <Dumbbell size={13} />
                        {totals.volumeKg.toLocaleString()} kg
                      </span>
                    )}
                    {totals.durationSeconds > 0 && (
                      <span>
                        <Clock3 size={13} />
                        {Math.round(totals.durationSeconds / 60)} min
                      </span>
                    )}
                    <ChevronDown className={isOpen ? 'is-open' : ''} size={18} />
                  </div>
                </button>
                {isOpen && editing === session.id && (
                  <div className="workout-history__details">
                    <SessionCorrectionForm
                      session={session}
                      exerciseName={(id) => catalog.get(id)?.name ?? id}
                      onDone={() => setEditing(null)}
                    />
                  </div>
                )}
                {isOpen && editing !== session.id && (
                  <div className="workout-history__details">
                    {session.exercises.map((exercise, index) => (
                      <div key={exercise.id}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>
                          {catalog.get(exercise.exerciseId)?.name ?? exercise.exerciseId}
                        </strong>
                        <small>
                          {exercise.logs
                            .map((log) =>
                              log.repsCompleted !== null
                                ? `${log.repsCompleted} × ${log.weightKg ?? 0} kg`
                                : `${log.durationSeconds ?? 0}s`,
                            )
                            .join(' · ') || t('flow.completion.noData')}
                        </small>
                      </div>
                    ))}
                    {canCorrect(session) && (
                      <button type="button" onClick={() => setEditing(session.id)}>
                        {t('correction.edit')}
                      </button>
                    )}
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
