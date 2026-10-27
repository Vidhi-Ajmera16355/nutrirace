import type { AddressInfo } from 'node:net';
import { closeServer, startHealthServer } from './health-server';

describe('worker health server', () => {
  it('reports liveness and readiness', async () => {
    let ready = true;
    const server = await startHealthServer(0, {
      alive: () => true,
      ready: () => Promise.resolve(ready),
    });
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      expect((await fetch(`${base}/health`)).status).toBe(200);
      expect((await fetch(`${base}/ready`)).status).toBe(200);
      ready = false;
      const res = await fetch(`${base}/ready`);
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ status: 'not_ready' });
      expect((await fetch(`${base}/other`)).status).toBe(404);
    } finally {
      await closeServer(server);
    }
  });
});
