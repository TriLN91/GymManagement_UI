import { z } from 'zod';

// FR-IAM-05: every request carries X-Tenant-Id; VITE_API_BASE_URL drives it indirectly.
// SSR-DP-05: data isolation is enforced at DB/API layer, env shape mirrors that contract.
const envSchema = z.object({
  VITE_APP_NAME: z.string().default('AI Fitness Coaching'),
  VITE_DEFAULT_LOCALE: z.enum(['en', 'vi']).default('en'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:8080/api/v1'),
  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  VITE_OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  VITE_OAUTH_APPLE_CLIENT_ID: z.string().optional(),
  VITE_ENABLE_MSW: z.coerce.boolean().default(true),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Environment validation failed', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed');
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;