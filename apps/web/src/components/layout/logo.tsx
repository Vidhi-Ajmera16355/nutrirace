import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"
      >
        <Leaf className="size-5" />
      </span>
      <span>
        Nutri<span className="text-accent">Race</span>
      </span>
    </Link>
  );
}
