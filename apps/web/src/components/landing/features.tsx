import { BellRing, CalendarCheck, Flame, MessagesSquare, Salad, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FEATURES = [
  {
    icon: Salad,
    title: 'Diet planner',
    text: 'Build weekly meal plans around your goals and preferences.',
  },
  {
    icon: CalendarCheck,
    title: 'Habit tracking',
    text: 'Log daily healthy habits and see consistency over time.',
  },
  {
    icon: Flame,
    title: 'Streaks & races',
    text: 'Challenge friends to habit races that keep everyone motivated.',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    text: 'Friendly rankings that celebrate progress, not perfection.',
  },
  {
    icon: MessagesSquare,
    title: 'Group chat',
    text: 'Cheer each other on in real time with your race group.',
  },
  {
    icon: BellRing,
    title: 'Gentle reminders',
    text: 'Timely nudges so good routines stay on track.',
  },
] as const;

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <h2 id="features-heading" className="text-3xl font-bold tracking-tight">
        What NutriRace is being built to do
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        None of these are available yet. Each arrives in a later development phase.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon aria-hidden="true" className="size-6 text-primary" />
                  <Badge tone="planned">Planned</Badge>
                </div>
                <CardTitle className="pt-2">{title}</CardTitle>
                <CardDescription>{text}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
