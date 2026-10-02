import { Check } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <span className="relative inline-grid h-5 w-5 shrink-0 place-items-center">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'peer h-5 w-5 appearance-none rounded-sm border border-input bg-background ring-offset-background checked:border-forest checked:bg-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
        strokeWidth={3}
      />
    </span>
  ),
);
Checkbox.displayName = 'Checkbox';
