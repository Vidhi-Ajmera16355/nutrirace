import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'planned' | 'done' }) {
  const tones = {
    neutral: 'bg-muted text-foreground',
    planned: 'bg-warning-bg text-warning-fg',
    done: 'bg-secondary text-secondary-foreground',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
