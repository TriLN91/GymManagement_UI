import { toast } from 'sonner';

import { errorMessage } from '@/shared/lib/errorMessage';

export interface RollbackAction {
  id: string;
  title: string;
  timestamp: number;
  expiresAt: number;
  status: 'available' | 'rolling_back' | 'rolled_back' | 'expired';
  rollback: () => Promise<void> | void;
  successMessage?: string;
  rollbackSuccessMessage?: string;
  onAfterRollback?: () => void | Promise<void>;
}

export interface ExecuteRollbackOptions<T> {
  actionName: string;
  execute: () => Promise<T>;
  rollback: () => Promise<void> | void;
  successMessage?: string;
  rollbackSuccessMessage?: string;
  duration?: number; // Duration in ms, defaults to 8000
  onAfterRollback?: () => void | Promise<void>;
  showToast?: boolean;
}

type RollbackSubscriber = (actions: RollbackAction[]) => void;

class ActionRollbackManager {
  private actions: RollbackAction[] = [];
  private subscribers: Set<RollbackSubscriber> = new Set();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.cleanupTimer = setInterval(() => {
        this.pruneExpired();
      }, 2000);

      // Listen for global Ctrl+Z / Cmd+Z to undo latest action when not inside input
      window.addEventListener('keydown', (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
          const activeTag = (document.activeElement?.tagName || '').toLowerCase();
          const isEditable =
            document.activeElement?.getAttribute('contenteditable') === 'true' ||
            ['input', 'textarea', 'select'].includes(activeTag);

          if (!isEditable && this.hasAvailableAction()) {
            e.preventDefault();
            void this.rollbackLatest();
          }
        }
      });
    }
  }

  public subscribe(subscriber: RollbackSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber([...this.actions]);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify() {
    const list = [...this.actions];
    this.subscribers.forEach((cb) => cb(list));
  }

  private pruneExpired() {
    const now = Date.now();
    let changed = false;
    this.actions = this.actions.map((act) => {
      if (act.status === 'available' && act.expiresAt < now) {
        changed = true;
        return { ...act, status: 'expired' };
      }
      return act;
    });

    // Keep history capped at 15 items
    if (this.actions.length > 15) {
      this.actions = this.actions.slice(0, 15);
      changed = true;
    }

    if (changed) {
      this.notify();
    }
  }

  public getActions(): RollbackAction[] {
    return [...this.actions];
  }

  public getLatestAvailable(): RollbackAction | undefined {
    return this.actions.find((a) => a.status === 'available');
  }

  public hasAvailableAction(): boolean {
    return Boolean(this.getLatestAvailable());
  }

  public async executeWithRollback<T>(options: ExecuteRollbackOptions<T>): Promise<T> {
    const {
      actionName,
      execute,
      rollback,
      successMessage,
      rollbackSuccessMessage,
      duration = 8000,
      onAfterRollback,
      showToast = true,
    } = options;

    const result = await execute();

    const actionId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();

    const actionItem: RollbackAction = {
      id: actionId,
      title: actionName,
      timestamp: now,
      expiresAt: now + duration,
      status: 'available',
      rollback,
      successMessage,
      rollbackSuccessMessage,
      onAfterRollback,
    };

    // Prepend to list
    this.actions = [actionItem, ...this.actions.filter((a) => a.id !== actionId)];
    this.notify();

    if (showToast) {
      const msg = successMessage || `Đã thực hiện: ${actionName}`;
      toast.success(msg, {
        description: 'Bạn có thể hoàn tác trong vòng ít giây nếu muốn khôi phục lại.',
        duration,
        action: {
          label: 'Hoàn tác ↩',
          onClick: () => {
            void this.rollbackAction(actionId);
          },
        },
      });
    }

    return result;
  }

  public async rollbackAction(actionId: string): Promise<boolean> {
    const action = this.actions.find((a) => a.id === actionId);
    if (!action || action.status !== 'available') {
      return false;
    }

    // Mark as rolling back
    this.actions = this.actions.map((a) =>
      a.id === actionId ? { ...a, status: 'rolling_back' } : a,
    );
    this.notify();

    try {
      await action.rollback();

      this.actions = this.actions.map((a) =>
        a.id === actionId ? { ...a, status: 'rolled_back' } : a,
      );
      this.notify();

      const successNotice = action.rollbackSuccessMessage || `Đã hoàn tác: ${action.title}!`;
      toast.success(successNotice, { duration: 4000 });

      if (action.onAfterRollback) {
        await action.onAfterRollback();
      }

      return true;
    } catch (err: unknown) {
      this.actions = this.actions.map((a) =>
        a.id === actionId ? { ...a, status: 'available' } : a,
      );
      this.notify();

      const errMsg = errorMessage(err) || 'Không thể hoàn tác thao tác. Vui lòng kiểm tra lại.';
      toast.error(errMsg);
      return false;
    }
  }

  public async rollbackLatest(): Promise<boolean> {
    const latest = this.getLatestAvailable();
    if (!latest) return false;
    return this.rollbackAction(latest.id);
  }

  public clearHistory() {
    this.actions = [];
    this.notify();
  }

  public destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

export const actionRollbackManager = new ActionRollbackManager();
