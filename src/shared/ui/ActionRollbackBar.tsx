import { CheckCircle2, Clock, History, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useActionRollback } from '@/shared/hooks/useActionRollback';
import { Button } from '@/shared/ui/button';

export function ActionRollbackBar() {
  const { actions, latestAction, canUndo, rollbackLatest, rollbackAction, clearHistory } =
    useActionRollback();
  const [showHistory, setShowHistory] = useState(false);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    if (!latestAction || latestAction.status !== 'available') {
      setRemainingSec(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(0, Math.ceil((latestAction.expiresAt - Date.now()) / 1000));
      setRemainingSec(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [latestAction]);

  const handleRollback = async () => {
    if (!canUndo || isRollingBack) return;
    setIsRollingBack(true);
    try {
      await rollbackLatest();
    } finally {
      setIsRollingBack(false);
    }
  };

  // If no action in history and not canUndo, don't show anything
  if (!canUndo && actions.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex select-none flex-col items-end gap-2">
      {/* Expanded History Modal / Popover */}
      {showHistory && (
        <div className="pointer-events-auto w-80 rounded-2xl border bg-card/95 p-4 text-xs shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 sm:w-96">
          <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <History size={14} className="text-primary" />
              Lịch sử thao tác gần đây
            </span>
            <div className="flex items-center gap-2">
              {actions.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[11px] text-muted-foreground underline transition hover:text-foreground"
                >
                  Xóa
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {actions.map((act) => (
              <div
                key={act.id}
                className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 transition ${
                  act.status === 'available'
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/60 bg-muted/40 opacity-80'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{act.title}</p>
                  <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={10} />
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div>
                  {act.status === 'available' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 border-primary/40 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={() => void rollbackAction(act.id)}
                    >
                      <RotateCcw size={12} />
                      Hoàn tác
                    </Button>
                  ) : act.status === 'rolling_back' ? (
                    <span className="animate-pulse text-[11px] text-muted-foreground">
                      Đang hoàn tác...
                    </span>
                  ) : act.status === 'rolled_back' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                      <CheckCircle2 size={12} />
                      Đã hoàn tác
                    </span>
                  ) : (
                    <span className="text-[10px] italic text-muted-foreground">Đã hết hạn</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Floating Rollback Pill */}
      {canUndo && latestAction && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/40 bg-foreground px-4 py-2.5 text-xs font-medium text-background shadow-xl animate-in fade-in slide-in-from-bottom-3 dark:bg-card dark:text-foreground">
          <div className="flex max-w-[200px] items-center gap-2 truncate sm:max-w-xs">
            <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" />
            <span className="truncate">{latestAction.title}</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-background/20 pl-2 dark:border-border/60">
            <Button
              size="sm"
              variant="default"
              disabled={isRollingBack}
              onClick={() => void handleRollback()}
              className="h-7 gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
            >
              <RotateCcw size={12} className={isRollingBack ? 'animate-spin' : ''} />
              Hoàn tác ({remainingSec}s)
            </Button>

            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="rounded-full p-1 text-background/70 transition hover:text-background dark:text-muted-foreground dark:hover:text-foreground"
              title="Xem lịch sử thao tác"
            >
              <History size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
