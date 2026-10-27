'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{ fontFamily: 'system-ui, sans-serif', padding: '4rem 1.5rem', textAlign: 'center' }}
      >
        <h1>NutriRace is unavailable</h1>
        <p>An unexpected error occurred.</p>
        <button type="button" onClick={reset} style={{ minHeight: 44, padding: '0 1.25rem' }}>
          Try again
        </button>
      </body>
    </html>
  );
}
