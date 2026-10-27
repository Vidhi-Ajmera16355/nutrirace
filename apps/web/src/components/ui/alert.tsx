import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'info' | 'success' | 'error';

const styles: Record<Variant, string> = {
  info: 'border-border bg-muted text-foreground',
  success: 'border-success/40 bg-secondary text-secondary-foreground',
  error: 'border-destructive/50 bg-red-50 text-red-900',
};
const icons = { info: Info, success: CircleCheck, error: CircleAlert } as const;

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: {
  variant?: Variant;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[variant];
  return (
    // Errors interrupt assistive tech (role=alert); other feedback is announced politely.
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border p-4', styles[variant], className)}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold leading-tight">{title}</p>
        {children ? <div className="text-sm">{children}</div> : null}
      </div>
    </div>
  );
}
