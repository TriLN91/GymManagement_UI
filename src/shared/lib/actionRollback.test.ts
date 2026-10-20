import { beforeEach, describe, expect, it, vi } from 'vitest';

import { actionRollbackManager } from './actionRollback';

describe('actionRollbackManager', () => {
  beforeEach(() => {
    actionRollbackManager.clearHistory();
  });

  it('records an action and executes rollback successfully', async () => {
    let state = 'initial';

    await actionRollbackManager.executeWithRollback({
      actionName: 'Thay đổi trạng thái',
      execute: async () => {
        await Promise.resolve();
        state = 'updated';
      },
      rollback: async () => {
        await Promise.resolve();
        state = 'initial';
      },
      showToast: false,
    });

    expect(state).toBe('updated');
    expect(actionRollbackManager.hasAvailableAction()).toBe(true);

    const latest = actionRollbackManager.getLatestAvailable();
    expect(latest?.title).toBe('Thay đổi trạng thái');

    const rollbackResult = await actionRollbackManager.rollbackLatest();
    expect(rollbackResult).toBe(true);
    expect(state).toBe('initial');
    expect(actionRollbackManager.hasAvailableAction()).toBe(false);
  });

  it('triggers onAfterRollback callback upon rollback', async () => {
    const onAfterRollback = vi.fn();

    await actionRollbackManager.executeWithRollback({
      actionName: 'Hủy liên kết',
      execute: async () => {},
      rollback: async () => {},
      onAfterRollback,
      showToast: false,
    });

    await actionRollbackManager.rollbackLatest();
    expect(onAfterRollback).toHaveBeenCalledTimes(1);
  });
});
