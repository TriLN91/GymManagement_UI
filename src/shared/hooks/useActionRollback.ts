import { useEffect, useState, useCallback } from 'react';
import {
  actionRollbackManager,
  type RollbackAction,
  type ExecuteRollbackOptions,
} from '@/shared/lib/actionRollback';

export function useActionRollback() {
  const [actions, setActions] = useState<RollbackAction[]>(() =>
    actionRollbackManager.getActions(),
  );

  useEffect(() => {
    const unsubscribe = actionRollbackManager.subscribe((newActions) => {
      setActions(newActions);
    });
    return unsubscribe;
  }, []);

  const latestAction = actions.find((a) => a.status === 'available');
  const canUndo = Boolean(latestAction);

  const executeWithRollback = useCallback(
    <T>(options: ExecuteRollbackOptions<T>): Promise<T> => {
      return actionRollbackManager.executeWithRollback(options);
    },
    [],
  );

  const rollbackAction = useCallback((actionId: string) => {
    return actionRollbackManager.rollbackAction(actionId);
  }, []);

  const rollbackLatest = useCallback(() => {
    return actionRollbackManager.rollbackLatest();
  }, []);

  const clearHistory = useCallback(() => {
    actionRollbackManager.clearHistory();
  }, []);

  return {
    actions,
    latestAction,
    canUndo,
    executeWithRollback,
    rollbackAction,
    rollbackLatest,
    clearHistory,
  };
}
