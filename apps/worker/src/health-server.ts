import { createServer, type Server } from 'node:http';

export interface HealthProbe {
  /** True while the process is running. */
  alive(): boolean;
  /** True when Redis is reachable and all workers are running. */
  ready(): Promise<boolean>;
}

/** Minimal HTTP server for container orchestrators: /health (liveness), /ready (readiness). */
export function startHealthServer(port: number, probe: HealthProbe): Promise<Server> {
  const server = createServer((req, res) => {
    const send = (status: number, body: Record<string, string>): void => {
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'GET') return send(405, { status: 'method_not_allowed' });
    if (req.url === '/health') {
      return send(probe.alive() ? 200 : 503, { status: probe.alive() ? 'ok' : 'down' });
    }
    if (req.url === '/ready') {
      probe.ready().then(
        (ok) => send(ok ? 200 : 503, { status: ok ? 'ready' : 'not_ready' }),
        () => send(503, { status: 'not_ready' }),
      );
      return;
    }
    send(404, { status: 'not_found' });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', () => resolve(server));
  });
}

export function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
    server.closeAllConnections();
  });
}
