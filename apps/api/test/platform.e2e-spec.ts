import type { INestApplication } from '@nestjs/common';
import type { ApiErrorResponse } from '@nutrirace/shared';
import request from 'supertest';
import { createTestApp, httpServer } from './harness';

describe('platform behaviour', () => {
  let app: INestApplication;
  afterEach(async () => {
    await app.close();
  });

  it('serves metadata under /api/v1 and nothing unversioned', async () => {
    ({ app } = await createTestApp());
    await request(httpServer(app)).get('/api/v1').expect(200);
    await request(httpServer(app)).get('/health').expect(404);
  });

  it('returns the consistent error shape for unknown routes', async () => {
    ({ app } = await createTestApp());
    const res = await request(httpServer(app)).get('/api/v1/nope?token=abc').expect(404);
    const body = res.body as ApiErrorResponse;
    expect(body).toMatchObject({ statusCode: 404, code: 'NOT_FOUND', path: '/api/v1/nope' });
    expect(body.requestId).toBe(res.headers['x-request-id']);
    expect(typeof body.timestamp).toBe('string');
  });

  it('echoes a valid inbound correlation id and replaces an invalid one', async () => {
    ({ app } = await createTestApp());
    const good = await request(httpServer(app)).get('/api/v1').set('X-Request-Id', 'abc-12345678');
    expect(good.headers['x-request-id']).toBe('abc-12345678');
    const bad = await request(httpServer(app))
      .get('/api/v1')
      .set('X-Request-Id', 'bad id with spaces');
    expect(bad.headers['x-request-id']).not.toBe('bad id with spaces');
    expect(String(bad.headers['x-request-id'])).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('sets security headers and hides the framework', async () => {
    ({ app } = await createTestApp());
    const res = await request(httpServer(app)).get('/api/v1');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('allows only configured CORS origins', async () => {
    ({ app } = await createTestApp({ FRONTEND_URL: 'https://app.example.org' }));
    const allowed = await request(httpServer(app))
      .get('/api/v1')
      .set('Origin', 'https://app.example.org');
    expect(allowed.headers['access-control-allow-origin']).toBe('https://app.example.org');
    const denied = await request(httpServer(app)).get('/api/v1').set('Origin', 'https://evil.test');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rate limits non-health routes but never health probes', async () => {
    ({ app } = await createTestApp({ RATE_LIMIT_LIMIT: '2', RATE_LIMIT_TTL_MS: '60000' }));
    await request(httpServer(app)).get('/api/v1').expect(200);
    await request(httpServer(app)).get('/api/v1').expect(200);
    const limited = await request(httpServer(app)).get('/api/v1').expect(429);
    expect((limited.body as ApiErrorResponse).code).toBe('RATE_LIMITED');
    for (let i = 0; i < 5; i += 1) await request(httpServer(app)).get('/api/v1/health').expect(200);
  });

  it('exposes Swagger in development and disables it in production', async () => {
    ({ app } = await createTestApp());
    await request(httpServer(app)).get('/api/docs-json').expect(200);
    await app.close();
    ({ app } = await createTestApp({
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://app.example.org',
      BACKEND_URL: 'https://api.example.org',
      AUTH_SECRET: 'k7Hq2mZp9Xw4Lr8Tn5Vb3Jc6Yd1Fg0Aa-s9QeUiOoPz',
    }));
    await request(httpServer(app)).get('/api/docs-json').expect(404);
  });
});
