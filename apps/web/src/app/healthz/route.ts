export const dynamic = 'force-dynamic';

/** Container health probe. Reveals nothing about the environment. */
export function GET(): Response {
  return Response.json(
    { status: 'ok', service: 'web' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
