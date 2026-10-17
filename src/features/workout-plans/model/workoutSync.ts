import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import { workoutApi } from '../api/workoutApi';

import { toSessionInput } from './liveWorkout';
import { useWorkoutSessionStore } from './useWorkoutSessionStore';
import type { CompletedWorkoutSession } from './workoutFlowTypes';

import { ApiError, AuthError } from '@/shared/api/errorTypes';

type SyncApi = Pick<typeof workoutApi, 'createSession' | 'completeSession'>;
type SyncState = CompletedWorkoutSession['sync'];

/** 400/404/409/422 mean the server will never accept this payload as-is; anything else is retried later. */
function isPermanent(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    !(error instanceof AuthError) &&
    [400, 404, 409, 422].includes(error.status)
  );
}

/**
 * Create (idempotent by ClientRequestId) then complete (idempotent per session) one workout.
 * The device completion time is sent unchanged on every retry; the backend accepts it only inside the late-sync window.
 */
export async function syncCompletedSession(
  session: CompletedWorkoutSession,
  api: SyncApi,
  onCreated: (backendSessionId: string) => void = () => {},
): Promise<SyncState> {
  let backendSessionId = session.sync.backendSessionId;
  try {
    if (!backendSessionId) {
      backendSessionId = (await api.createSession(toSessionInput(session))).id;
      onCreated(backendSessionId);
    }
    await api.completeSession(backendSessionId, session.completedAt);
    return { status: 'synced', backendSessionId, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    return {
      status: isPermanent(error) ? 'rejected' : 'pending',
      backendSessionId,
      error: message,
    };
  }
}

let running: Promise<void> | null = null;

/** Pushes every pending workout once at a time; safe to call from several screens. */
export async function syncPendingSessions(api: SyncApi = workoutApi): Promise<boolean> {
  if (running) {
    await running;
    return false;
  }
  let changed = false;
  running = (async () => {
    const store = useWorkoutSessionStore.getState();
    for (const session of store.completedSessions.filter(
      (item) => item.sync.status === 'pending',
    )) {
      const result = await syncCompletedSession(session, api, (backendSessionId) =>
        useWorkoutSessionStore.getState().updateSync(session.id, {
          status: 'pending',
          backendSessionId,
          error: null,
        }),
      );
      useWorkoutSessionStore.getState().updateSync(session.id, result);
      if (result.status === 'synced') changed = true;
    }
  })();
  try {
    await running;
  } finally {
    running = null;
  }
  return changed;
}

/** Syncs on mount, when the browser comes back online, and on demand; refreshes server-derived views after a sync. */
export function useWorkoutSync() {
  const queryClient = useQueryClient();
  const sync = useCallback(async () => {
    if (await syncPendingSessions()) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['progression'] }),
        queryClient.invalidateQueries({ queryKey: ['workouts'] }),
      ]);
    }
  }, [queryClient]);
  useEffect(() => {
    void sync();
    const onOnline = () => void sync();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [sync]);
  return sync;
}
