import Link from 'next/link';
import { Logo } from './logo';

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            Social diet planning and healthy-habit tracking. Currently in early development.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            <li>
              <Link href="/#roadmap" className="hover:underline">
                Roadmap
              </Link>
            </li>
            <li>
              <Link href="/styleguide" className="hover:underline">
                Design system
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
