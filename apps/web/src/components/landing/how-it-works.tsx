const STEPS = [
  { title: 'Plan', text: 'Set a goal and shape a meal plan that fits your week.' },
  { title: 'Track', text: 'Check off the habits that matter and watch your streak grow.' },
  { title: 'Race', text: 'Invite friends, compare progress and keep each other going.' },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="bg-muted">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="how-heading" className="text-3xl font-bold tracking-tight">
          How it will work
        </h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
