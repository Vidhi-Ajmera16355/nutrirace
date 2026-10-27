import { Writable } from 'node:stream';
import { createLogger } from './logger';

describe('createLogger', () => {
  it('redacts sensitive fields and tags the service', () => {
    const chunks: string[] = [];
    const destination = new Writable({
      write(chunk: Buffer, _enc, cb) {
        chunks.push(chunk.toString());
        cb();
      },
    });
    const logger = createLogger({ service: 'test', level: 'info', destination });
    logger.info(
      { req: { headers: { authorization: 'Bearer abc', accept: 'x' } }, AUTH_SECRET: 's' },
      'hi',
    );
    const line = JSON.parse(chunks.join('')) as Record<string, unknown>;
    expect(line['service']).toBe('test');
    expect(JSON.stringify(line)).not.toContain('Bearer abc');
    expect(line['AUTH_SECRET']).toBe('[REDACTED]');
  });
});
