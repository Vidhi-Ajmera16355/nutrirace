import type { Metadata } from 'next';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState, ErrorState } from '@/components/ui/state-panel';

export const metadata: Metadata = {
  title: 'Design system',
  description: 'Reusable NutriRace interface primitives.',
  robots: { index: false },
};

export default function StyleguidePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight">Design system</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Reusable primitives shared by every future screen. These are static demonstrations;
          nothing here submits data.
        </p>
      </header>

      <section aria-labelledby="buttons" className="flex flex-col gap-4">
        <h2 id="buttons" className="text-2xl font-bold">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section aria-labelledby="cards" className="flex flex-col gap-4">
        <h2 id="cards" className="text-2xl font-bold">
          Cards and badges
        </h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Supporting description text.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="planned">Planned</Badge>
            <Badge tone="done">Done</Badge>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="forms" className="flex flex-col gap-4">
        <h2 id="forms" className="text-2xl font-bold">
          Form fields
        </h2>
        <div className="grid max-w-3xl gap-6 md:grid-cols-2">
          <FormField id="demo-name" label="Display name" hint="How friends will see you." />
          <FormField
            id="demo-email"
            label="Email"
            type="email"
            required
            defaultValue="not-an-email"
            error="Enter a valid email address."
          />
        </div>
      </section>

      <section aria-labelledby="feedback" className="flex flex-col gap-4">
        <h2 id="feedback" className="text-2xl font-bold">
          Feedback
        </h2>
        <div className="flex max-w-2xl flex-col gap-3">
          <Alert title="Heads up">Neutral information for the reader.</Alert>
          <Alert variant="success" title="Saved">
            Positive confirmation.
          </Alert>
          <Alert variant="error" title="Could not save">
            Errors are announced immediately to assistive technology.
          </Alert>
        </div>
      </section>

      <section aria-labelledby="states" className="flex flex-col gap-4">
        <h2 id="states" className="text-2xl font-bold">
          Loading, empty and error states
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Spinner />
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
          <EmptyState
            title="Nothing here yet"
            description="When there is data it will appear here."
          />
          <ErrorState title="Unable to load" description="Check your connection and try again." />
        </div>
      </section>
    </div>
  );
}
