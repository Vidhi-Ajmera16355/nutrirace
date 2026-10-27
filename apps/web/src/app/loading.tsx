import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6">
      <Spinner />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-6 w-full max-w-xl" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
