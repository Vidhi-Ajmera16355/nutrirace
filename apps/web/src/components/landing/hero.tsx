import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-gradient-to-b from-secondary to-background"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 md:py-24">
        <Badge tone="planned">Early development — features arrive in phases</Badge>
        <h1
          id="hero-heading"
          className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
        >
          Eat well together. Build habits that <span className="text-primary">last</span>.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          NutriRace is being built as a social home for diet planning and healthy-habit tracking:
          plan your meals, keep your streaks, and race friends toward the routines you actually
          want.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="#how-it-works">See how it will work</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#roadmap">View the roadmap</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
