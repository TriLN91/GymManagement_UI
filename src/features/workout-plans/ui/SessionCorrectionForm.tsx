import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { LogInput, SessionView } from '../api/types';
import { useCorrectSession } from '../model/useLiveWorkout';

import { ApiError } from '@/shared/api/errorTypes';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

type Draft = Record<string, LogInput[]>;

const toNumber = (value: string) => (value.trim() === '' ? null : Number(value));

/** Edit the reps, weight or duration of the sets of a finished session (FR-CF01-05). */
export function SessionCorrectionForm({
  session,
  exerciseName,
  onDone,
}: {
  session: SessionView;
  exerciseName: (exerciseId: string) => string;
  onDone: () => void;
}) {
  const { t } = useTranslation('workout');
  const correct = useCorrectSession();
  const [draft, setDraft] = useState<Draft>(() =>
    Object.fromEntries(session.exercises.map((e) => [e.id, e.logs.map((log) => ({ ...log }))])),
  );

  const setLog = (exerciseId: string, index: number, patch: Partial<LogInput>) =>
    setDraft((current) => ({
      ...current,
      [exerciseId]: (current[exerciseId] ?? []).map((log, i) =>
        i === index ? { ...log, ...patch } : log,
      ),
    }));

  const save = async () => {
    try {
      await correct.mutateAsync({
        sessionId: session.id,
        body: {
          expectedRevision: session.revision,
          notes: session.notes,
          exercises: session.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sortOrder: e.sortOrder,
            logs: draft[e.id] ?? e.logs,
          })),
          activitySegments: [],
        },
      });
      toast.success(t('correction.saved'));
      onDone();
    } catch (error) {
      const code = error instanceof ApiError ? error.code : '';
      toast.error(
        code === 'CorrectionWindowClosed'
          ? t('correction.windowClosed')
          : code === 'ConcurrencyConflict'
            ? t('correction.stale')
            : t('correction.failed'),
      );
    }
  };

  return (
    <form
      className="workout-history__correction"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      {session.exercises.map((exercise) => (
        <fieldset key={exercise.id}>
          <legend>{exerciseName(exercise.exerciseId)}</legend>
          {(draft[exercise.id] ?? []).map((log, index) => (
            <div key={log.setNumber} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span>#{log.setNumber}</span>
              {log.repsCompleted !== null ? (
                <>
                  <Input
                    type="number"
                    min={0}
                    aria-label={t('correction.reps', { set: log.setNumber })}
                    value={log.repsCompleted}
                    onChange={(e) =>
                      setLog(exercise.id, index, { repsCompleted: toNumber(e.target.value) })
                    }
                  />
                  <Input
                    type="number"
                    min={0}
                    step="0.5"
                    aria-label={t('correction.weight', { set: log.setNumber })}
                    value={log.weightKg ?? ''}
                    onChange={(e) =>
                      setLog(exercise.id, index, { weightKg: toNumber(e.target.value) })
                    }
                  />
                </>
              ) : (
                <Input
                  type="number"
                  min={0}
                  aria-label={t('correction.duration', { set: log.setNumber })}
                  value={log.durationSeconds ?? ''}
                  onChange={(e) =>
                    setLog(exercise.id, index, { durationSeconds: toNumber(e.target.value) })
                  }
                />
              )}
            </div>
          ))}
        </fieldset>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="submit" size="sm" disabled={correct.isPending}>
          {t('correction.save')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          {t('correction.cancel')}
        </Button>
      </div>
    </form>
  );
}
