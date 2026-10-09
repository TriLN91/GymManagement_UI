import { z } from 'zod';

// Vite env values are always strings, so booleans must be parsed explicitly:
// z.coerce.boolean() turns the string "false" into true.
const booleanFlag = z.enum(['true', 'false']).transform((value) => value === 'true');

export const envSchema = z.object({
  VITE_APP_NAME: z.string().default('AI Fitness Coaching'),
  VITE_DEFAULT_LOCALE: z.enum(['en', 'vi']).default('en'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:8080/api/v1'),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  VITE_OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  VITE_OAUTH_APPLE_CLIENT_ID: z.string().optional(),
  VITE_ENABLE_MSW: booleanFlag.optional(),
});

type ParsedEnv = Omit<z.infer<typeof envSchema>, 'VITE_ENABLE_MSW'> & { VITE_ENABLE_MSW: boolean };

/** MSW defaults to on in dev and off in production builds. */
export function parseEnv(raw: Record<string, unknown>, isProd: boolean): ParsedEnv {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('Environment validation failed', parsed.error.flatten().fieldErrors);
    throw new Error('Environment validation failed');
  }
  return { ...parsed.data, VITE_ENABLE_MSW: parsed.data.VITE_ENABLE_MSW ?? !isProd };
}

export const env = parseEnv(import.meta.env, import.meta.env.PROD);
export type Env = typeof env;
