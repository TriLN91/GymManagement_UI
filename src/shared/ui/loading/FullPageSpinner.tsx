import { Loader2 } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

export interface FullPageSpinnerProps {
  className?: string;
  label?: string;
}

export function FullPageSpinner({ className, label }: FullPageSpinnerProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center gap-2 bg-background',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  );
}