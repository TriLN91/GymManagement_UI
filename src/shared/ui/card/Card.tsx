import { createElement, forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/**
 * Polymorphic card title. Defaults to `<div>` for backward compatibility —
 * callers that want a real heading landmark should pass `as="h2" | "h3" | ...`.
 */
type CardTitleTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';

type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: CardTitleTag;
  children?: ReactNode;
};

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as = 'div', children, ...props }, ref) => {
    // `createElement` infers `as` element-type props; restrict to string tag.
    const Tag = as as 'div';
    return createElement(Tag, {
      ref,
      className: cn('text-2xl font-semibold leading-none tracking-tight', className),
      ...props,
      children,
    });
  },
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';
