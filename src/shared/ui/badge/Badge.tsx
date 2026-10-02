import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

const badgeVariants = cva(
  'inline-flex min-h-6 w-fit items-center justify-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.05em]',
  {
    variants: {
      variant: {
        default: 'border-forest bg-forest text-white',
        accent: 'border-pebble/60 bg-energy text-forest',
        neutral: 'border-border bg-background text-muted-foreground',
        destructive: 'border-destructive/35 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = 'Badge';
