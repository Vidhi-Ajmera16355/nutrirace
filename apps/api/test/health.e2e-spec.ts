import type { INestApplication } from '@nestjs/common';
import type { HealthResponse, ReadinessResponse } from '@nutrirace/shared';
import request from 'supertest';
import { createTestApp, httpServer } from './harness';

describe('health endpoints', () => {
  let app: INestApplication;
  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns liveness without leaking configuration', async () => {
    ({ app } = await createTestApp());
    const res = await request(httpServer(app)).get('/api/v1/health').expect(200);
    const body = res.body as HealthResponse;
    expect(body).toMatchObject({ status: 'ok', service: 'api', version: '0.1.0' });
    expect(typeof body.uptimeSeconds).toBe('number');
    const text = JSON.stringify(res.body);
    expect(text).not.toMatch(/postgres|redis:|AUTH_SECRET|password/i);
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('GET /api/v1/ready returns 200 when dependencies are up', async () => {
    ({ app } = await createTestApp());
    const res = await request(httpServer(app)).get('/api/v1/ready').expect(200);
    expect((res.body as ReadinessResponse).checks).toEqual({ database: 'up', redis: 'up' });
    expect((res.body as ReadinessResponse).status).toBe('ready');
  });

  it('GET /api/v1/ready returns 503 and hides error details when a dependency is down', async () => {
    ({ app } = await createTestApp({}, { dbUp: false, redisUp: true }));
    const res = await request(httpServer(app)).get('/api/v1/ready').expect(503);
    expect((res.body as ReadinessResponse).checks).toEqual({ database: 'down', redis: 'up' });
    expect(JSON.stringify(res.body)).not.toMatch(/ECONNREFUSED|secret|postgresql/);
  });
});
