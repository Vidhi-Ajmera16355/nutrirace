import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { z } from 'zod';

/** Insecure value permitted ONLY outside production so local development works out of the box. */
export const DEV_AUTH_SECRET = 'development-only-auth-secret-never-use-in-production';

const PLACEHOLDER_PATTERN = /change[-_ ]?me|placeholder|replace[-_ ]?me|example|your[-_ ]?secret/i;

export class EnvValidationError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid environment configuration:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'EnvValidationError';
  }
}

export type RawEnv = Record<string, string | undefined>;

const httpUrl = z
  .string()
  .refine((v) => /^https?:\/\//i.test(v) && URL.canParse(v), 'must be an http(s) URL');
const redisUrl = z
  .string()
  .refine((v) => /^rediss?:\/\//i.test(v) && URL.canParse(v), 'must be a redis(s):// URL');
const mongoUrl = z
  .string()
  .refine(
    (v) => /^mongodb(\+srv)?:\/\//i.test(v),
    'must be a mongodb:// or mongodb+srv:// URL',
  );
const port = z.coerce.number().int().min(1).max(65535);
const booleanString = z.enum(['true', 'false']).transform((v) => v === 'true');
const logLevel = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);

/** Drops empty strings so `FOO=` in a .env file behaves like an unset variable. */
function normalize(raw: RawEnv): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string' && value.trim() !== '') out[key] = value.trim();
  }
  return out;
}

export interface LoadEnvOptions {
  /** Defaults applied ONLY when NODE_ENV is not "production". */
  devDefaults?: Record<string, string>;
  /** Variables that must be set explicitly in production (no defaults, no fallbacks). */
  productionRequired?: string[];
}

/**
 * Validates environment variables against a zod schema.
 * Error messages name the offending variables but never echo their values.
 */
export function loadEnv<S extends z.ZodType>(
  schema: S,
  raw: RawEnv,
  { devDefaults = {}, productionRequired = [] }: LoadEnvOptions = {},
): z.output<S> {
  const env = normalize(raw);
  const isProduction = env['NODE_ENV'] === 'production';
  const problems: string[] = [];

  if (isProduction) {
    for (const key of productionRequired) {
      if (!(key in env)) problems.push(`${key}: required in production`);
    }
  }

  const input = isProduction ? env : { ...devDefaults, ...env };
  const result = schema.safeParse(input);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || '(root)';
      if (problems.some((p) => p.startsWith(`${path}: required in production`))) continue;
      const line = `${path}: ${issue.message}`;
      if (!problems.includes(line)) problems.push(line);
    }
  }
  if (problems.length > 0 || !result.success) throw new EnvValidationError(problems);
  return result.data;
}

/** Variables shared by every Node.js application. */
export const baseEnvShape = {
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: logLevel.default('info'),
  REDIS_URL: redisUrl,
  SENTRY_DSN: httpUrl.optional(),
};

export const apiEnvSchema = z
  .object({
    ...baseEnvShape,
    FRONTEND_URL: httpUrl,
    BACKEND_URL: httpUrl,
    API_PREFIX: z
      .string()
      .regex(/^[a-z0-9-]+(\/[a-z0-9-]+)*$/, 'must be lowercase path segments, e.g. "api"')
      .default('api'),
    API_PORT: port.default(4000),
    DATABASE_URL: mongoUrl,
    AUTH_SECRET: z.string().min(32, 'must be at least 32 characters'),
    CORS_ORIGINS: z.string().optional(),
    TRUST_PROXY: booleanString.default(false),
    RATE_LIMIT_TTL_MS: z.coerce.number().int().min(1000).default(60_000),
    RATE_LIMIT_LIMIT: z.coerce.number().int().min(1).default(100),
    SWAGGER_ENABLED: booleanString.optional(),
  })
  .superRefine((env, ctx) => {
    const origins = (env.CORS_ORIGINS ?? '').split(',').filter((o) => o.trim() !== '');
    for (const origin of origins) {
      if (origin.trim() === '*' || !/^https?:\/\//i.test(origin.trim())) {
        ctx.addIssue({
          code: 'custom',
          path: ['CORS_ORIGINS'],
          message: 'must be a comma-separated list of explicit http(s) origins (no wildcards)',
        });
        break;
      }
    }
    if (env.NODE_ENV === 'production') {
      if (env.AUTH_SECRET === DEV_AUTH_SECRET || PLACEHOLDER_PATTERN.test(env.AUTH_SECRET)) {
        ctx.addIssue({
          code: 'custom',
          path: ['AUTH_SECRET'],
          message: 'must not be a development default or placeholder in production',
        });
      }
    }
  })
  .transform((env) => ({
    ...env,
    SWAGGER_ENABLED: env.SWAGGER_ENABLED ?? env.NODE_ENV !== 'production',
    CORS_ORIGINS: [
      ...new Set(
        [env.FRONTEND_URL, ...(env.CORS_ORIGINS ?? '').split(',')]
          .map((o) => o.trim())
          .filter((o) => o !== '')
          .map((o) => new URL(o).origin),
      ),
    ],
  }));

export type ApiEnv = z.output<typeof apiEnvSchema>;

export const workerEnvSchema = z.object({
  ...baseEnvShape,
  // 0 lets the OS pick a free port (used by tests).
  WORKER_HEALTH_PORT: z.coerce.number().int().min(0).max(65535).default(4001),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(100).default(5),
});

export type WorkerEnv = z.output<typeof workerEnvSchema>;

export function loadApiEnv(raw: RawEnv = process.env): ApiEnv {
  return loadEnv(apiEnvSchema, raw, {
    devDefaults: {
      FRONTEND_URL: 'http://localhost:3000',
      BACKEND_URL: 'http://localhost:4000',
      REDIS_URL: 'redis://localhost:6379',
      AUTH_SECRET: DEV_AUTH_SECRET,
    },
    productionRequired: ['FRONTEND_URL', 'BACKEND_URL', 'DATABASE_URL', 'REDIS_URL', 'AUTH_SECRET'],
  });
}

export function loadWorkerEnv(raw: RawEnv = process.env): WorkerEnv {
  return loadEnv(workerEnvSchema, raw, {
    devDefaults: { REDIS_URL: 'redis://localhost:6379' },
    productionRequired: ['REDIS_URL'],
  });
}

/**
 * Loads the nearest `.env` file (searching upward from `startDir`) into process.env
 * WITHOUT overriding variables that are already set. Never used in production, where the
 * platform injects configuration.
 */
export function loadDotenvFile(startDir: string = process.cwd()): void {
  if (process.env['NODE_ENV'] === 'production') return;
  let dir = resolve(startDir);
  for (let depth = 0; depth < 5; depth += 1) {
    const candidate = join(dir, '.env');
    try {
      readFileSync(candidate);
      process.loadEnvFile(candidate);
      return;
    } catch {
      // not found here; keep walking up
    }
    const parent = dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
}
