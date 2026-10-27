import { DEV_AUTH_SECRET, EnvValidationError, loadApiEnv, loadWorkerEnv } from './env';

const DB = 'postgresql://user:pw@localhost:5432/db';
const STRONG = 'k7Hq2mZp9Xw4Lr8Tn5Vb3Jc6Yd1Fg0Aa-s9QeUiOoPz';

const validProduction = {
  NODE_ENV: 'production',
  FRONTEND_URL: 'https://app.example.org',
  BACKEND_URL: 'https://api.example.org',
  DATABASE_URL: DB,
  REDIS_URL: 'redis://redis:6379',
  AUTH_SECRET: STRONG,
};

describe('loadApiEnv', () => {
  it('applies safe development defaults outside production', () => {
    const env = loadApiEnv({ DATABASE_URL: DB });
    expect(env.NODE_ENV).toBe('development');
    expect(env.API_PORT).toBe(4000);
    expect(env.AUTH_SECRET).toBe(DEV_AUTH_SECRET);
    expect(env.SWAGGER_ENABLED).toBe(true);
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:3000']);
  });

  it('requires DATABASE_URL even in development', () => {
    expect(() => loadApiEnv({})).toThrow(EnvValidationError);
  });

  it('accepts a complete production configuration and disables Swagger by default', () => {
    const env = loadApiEnv(validProduction);
    expect(env.SWAGGER_ENABLED).toBe(false);
    expect(env.CORS_ORIGINS).toEqual(['https://app.example.org']);
  });

  it('rejects production configs that rely on defaults', () => {
    let error: EnvValidationError | undefined;
    try {
      loadApiEnv({ NODE_ENV: 'production', DATABASE_URL: DB });
    } catch (e) {
      error = e as EnvValidationError;
    }
    expect(error).toBeInstanceOf(EnvValidationError);
    const text = error?.problems.join('\n') ?? '';
    for (const key of ['FRONTEND_URL', 'BACKEND_URL', 'REDIS_URL', 'AUTH_SECRET']) {
      expect(text).toContain(`${key}: required in production`);
    }
  });

  it('rejects the development secret and placeholder secrets in production', () => {
    expect(() => loadApiEnv({ ...validProduction, AUTH_SECRET: DEV_AUTH_SECRET })).toThrow(
      /AUTH_SECRET/,
    );
    expect(() =>
      loadApiEnv({ ...validProduction, AUTH_SECRET: 'change_me_generate_a_random_value_of_32+' }),
    ).toThrow(/placeholder/);
  });

  it('rejects short secrets and wildcard CORS origins', () => {
    expect(() => loadApiEnv({ ...validProduction, AUTH_SECRET: 'short' })).toThrow(/32 characters/);
    expect(() => loadApiEnv({ ...validProduction, CORS_ORIGINS: '*' })).toThrow(/CORS_ORIGINS/);
  });

  it('never echoes secret values in error messages', () => {
    try {
      loadApiEnv({ ...validProduction, AUTH_SECRET: 'tiny-secret-value' });
      throw new Error('expected failure');
    } catch (e) {
      expect((e as Error).message).not.toContain('tiny-secret-value');
    }
  });

  it('treats empty strings as unset', () => {
    const env = loadApiEnv({ DATABASE_URL: DB, SENTRY_DSN: '', CORS_ORIGINS: '' });
    expect(env.SENTRY_DSN).toBeUndefined();
  });
});

describe('loadWorkerEnv', () => {
  it('defaults in development and requires REDIS_URL in production', () => {
    expect(loadWorkerEnv({}).WORKER_HEALTH_PORT).toBe(4001);
    expect(() => loadWorkerEnv({ NODE_ENV: 'production' })).toThrow(/REDIS_URL/);
  });
});
