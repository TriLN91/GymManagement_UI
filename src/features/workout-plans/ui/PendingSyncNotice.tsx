import { CloudOff, RefreshCw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useWorkoutSessionStore } from '../model/useWorkoutSessionStore';
import { useWorkoutSync } from '../model/workoutSync';

/** Workouts finished on this device that the server has not stored yet (offline, or rejected). */
export function PendingSyncNotice() {
  const { t } = useTranslation('workout');
  const sync = useWorkoutSync();
  const [busy, setBusy] = useState(false);
  const completed = useWorkoutSessionStore((state) => state.completedSessions);
  const sessions = useMemo(
    () => completed.filter((session) => session.sync.status !== 'synced'),
    [completed],
  );
  const discard = useWorkoutSessionStore((state) => state.discardSession);
  if (sessions.length === 0) return null;
  return (
    <section className="workout-sync-notice" aria-live="polite">
      {sessions.map((session) => (
        <div key={session.id} className={`is-${session.sync.status}`}>
          <CloudOff aria-hidden size={16} />
          <span>
            {session.title} ·{' '}
            {session.sync.status === 'rejected'
              ? t('flow.live.sync.rejected', { error: session.sync.error ?? '' })
              : t('flow.live.sync.pending')}
          </span>
          {session.sync.status === 'pending' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void sync().finally(() => setBusy(false));
              }}
            >
              <RefreshCw aria-hidden size={14} /> {t('flow.live.sync.retry')}
            </button>
          ) : (
            <button type="button" onClick={() => discard(session.id)}>
              <Trash2 aria-hidden size={14} /> {t('flow.live.sync.discard')}
            </button>
          )}
        </div>
      ))}
    </section>
  );
}
