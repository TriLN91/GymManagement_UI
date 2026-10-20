import { RotateCcw, X, History, CheckCircle2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none select-none">
      {/* Expanded History Modal / Popover */}
      {showHistory && (
        <div className="pointer-events-auto w-80 sm:w-96 rounded-2xl border bg-card/95 backdrop-blur-md shadow-2xl p-4 text-xs transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <History size={14} className="text-primary" />
              Lịch sử thao tác gần đây
            </span>
            <div className="flex items-center gap-2">
              {actions.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition underline"
                >
                  Xóa
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {actions.map((act) => (
              <div
                key={act.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                  act.status === 'available'
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-muted/40 border-border/60 opacity-80'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{act.title}</p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div>
                  {act.status === 'available' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
                      onClick={() => void rollbackAction(act.id)}
                    >
                      <RotateCcw size={12} />
                      Hoàn tác
                    </Button>
                  ) : act.status === 'rolling_back' ? (
                    <span className="text-[11px] text-muted-foreground animate-pulse">
                      Đang hoàn tác...
                    </span>
                  ) : act.status === 'rolled_back' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <CheckCircle2 size={12} />
                      Đã hoàn tác
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">Đã hết hạn</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Floating Rollback Pill */}
      {canUndo && latestAction && (
        <div className="pointer-events-auto flex items-center gap-3 bg-foreground text-background dark:bg-card dark:text-foreground border border-border/40 shadow-xl rounded-full px-4 py-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2 max-w-[200px] sm:max-w-xs truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="truncate">
              {latestAction.title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-background/20 dark:border-border/60 pl-2">
            <Button
              size="sm"
              variant="default"
              disabled={isRollingBack}
              onClick={() => void handleRollback()}
              className="h-7 px-3 text-xs font-semibold gap-1.5 rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90"
            >
              <RotateCcw size={12} className={isRollingBack ? 'animate-spin' : ''} />
              Hoàn tác ({remainingSec}s)
            </Button>

            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="p-1 rounded-full text-background/70 hover:text-background dark:text-muted-foreground dark:hover:text-foreground transition"
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
