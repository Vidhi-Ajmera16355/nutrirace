'use client';

import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/state-panel';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred. You can try again."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </div>
  );
}
