import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border p-8 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="grid h-12 w-12 place-items-center rounded-full bg-energy text-forest">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
