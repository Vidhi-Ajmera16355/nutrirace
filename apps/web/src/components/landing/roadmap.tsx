import { Badge } from '@/components/ui/badge';

const ITEMS = [
  {
    title: 'Platform foundation',
    status: 'done',
    text: 'Monorepo, API, worker, database and tooling.',
  },
  { title: 'Accounts & authentication', status: 'planned', text: 'Sign-up, sign-in and profiles.' },
  {
    title: 'Diet planner & habit tracking',
    status: 'planned',
    text: 'The core planning and tracking experience.',
  },
  {
    title: 'Social, chat & leaderboards',
    status: 'planned',
    text: 'Friends, races, real-time chat and rankings.',
  },
] as const;

export function Roadmap() {
  return (
    <section
      id="roadmap"
      aria-labelledby="roadmap-heading"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <h2 id="roadmap-heading" className="text-3xl font-bold tracking-tight">
        Roadmap
      </h2>
      <ul className="mt-8 flex flex-col gap-3">
        {ITEMS.map((item) => (
          <li
            key={item.title}
            className="flex flex-col gap-1 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </div>
            <Badge tone={item.status === 'done' ? 'done' : 'planned'}>
              {item.status === 'done' ? 'Foundation in place' : 'Planned'}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
