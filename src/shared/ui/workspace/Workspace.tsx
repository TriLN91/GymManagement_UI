import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface WorkspacePageProps extends HTMLAttributes<HTMLDivElement> {
  width?: 'default' | 'wide';
}

export const WorkspacePage = forwardRef<HTMLDivElement, WorkspacePageProps>(
  ({ className, width = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'mx-auto w-[calc(100%-40px)] py-[30px] pb-16 text-forest',
        width === 'wide' ? 'max-w-[1400px]' : 'max-w-[1160px]',
        className,
      )}
      {...props}
    />
  ),
);
WorkspacePage.displayName = 'WorkspacePage';

export const WorkspaceToolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4 flex flex-wrap items-center justify-between gap-3', className)}
      {...props}
    />
  ),
);
WorkspaceToolbar.displayName = 'WorkspaceToolbar';

export const WorkspacePanel = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <section ref={ref} className={cn('border bg-card', className)} {...props} />
  ),
);
WorkspacePanel.displayName = 'WorkspacePanel';

export const WorkspacePanelHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 border-b px-6 py-5',
        className,
      )}
      {...props}
    />
  ),
);
WorkspacePanelHeader.displayName = 'WorkspacePanelHeader';

export const WorkspacePanelTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('text-lg font-bold text-forest', className)} {...props} />
));
WorkspacePanelTitle.displayName = 'WorkspacePanelTitle';

export const WorkspacePanelContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6', className)} {...props} />,
);
WorkspacePanelContent.displayName = 'WorkspacePanelContent';
