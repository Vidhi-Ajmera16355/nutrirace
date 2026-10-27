import { CircleAlert, Inbox } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatePanelProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

function Panel({
  icon,
  title,
  description,
  action,
  className,
}: StatePanelProps & { icon: React.ReactNode }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center',
        className,
      )}
    >
      <div aria-hidden="true" className="text-muted-foreground">
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

/** Presentation primitive for "nothing here yet". */
export function EmptyState(props: StatePanelProps) {
  return <Panel icon={<Inbox className="size-10" />} {...props} />;
}

/** Presentation primitive for recoverable failures. Announced to assistive tech. */
export function ErrorState(props: StatePanelProps) {
  return (
    <div role="alert">
      <Panel icon={<CircleAlert className="size-10 text-destructive" />} {...props} />
    </div>
  );
}
