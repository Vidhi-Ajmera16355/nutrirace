import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-muted-foreground">
      <LoaderCircle
        aria-hidden="true"
        className={cn('size-5 animate-spin motion-reduce:animate-none', className)}
      />
      <span>{label}…</span>
    </span>
  );
}
