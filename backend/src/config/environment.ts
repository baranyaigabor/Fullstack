import { z } from 'zod';

const hostnameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/,
    'must be a public hostname',
  );

const optionalString = z.string().trim().optional();

const productionSchema = z
  .object({
    APP_DOMAIN: hostnameSchema,
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, 'must contain at least 32 characters')
      .refine(
        (value) =>
          !/local-development|change-before-production|replace-with/i.test(
            value,
          ),
        'must not use a starter or placeholder value',
      ),
    BETTER_AUTH_URL: z.url(),
    CACHE_URL: z.url(),
    DATABASE_URL: z
      .url()
      .refine(
        (value) => /^postgres(?:ql)?:\/\//i.test(value),
        'must be a PostgreSQL URL',
      )
      .refine((value) => {
        const password = decodeURIComponent(new URL(value).password);
        return (
          password.length >= 16 &&
          !/starter[-_]local[-_]password|change-this|replace-with/i.test(
            password,
          )
        );
      }, 'must contain a unique database password with at least 16 characters'),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive(),
    RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive(),
    SEARCH_ENGINE_MASTER_KEY: z
      .string()
      .min(16, 'must contain at least 16 characters')
      .refine(
        (value) =>
          !/starter_dev_master_key|replace-with|change-this/i.test(value),
        'must not use a starter or placeholder value',
      ),
    SEARCH_ENGINE_URL: z.url(),
    AWS_ACCESS_KEY_ID: optionalString,
    AWS_SECRET_ACCESS_KEY: optionalString,
    FACEBOOK_CLIENT_ID: optionalString,
    FACEBOOK_CLIENT_SECRET: optionalString,
    GITHUB_CLIENT_ID: optionalString,
    GITHUB_CLIENT_SECRET: optionalString,
    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,
    MAIL_FROM: optionalString,
    MICROSOFT_CLIENT_ID: optionalString,
    MICROSOFT_CLIENT_SECRET: optionalString,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
    R2_ACCESS_KEY_ID: optionalString,
    R2_BUCKET: optionalString,
    R2_ENDPOINT: optionalString,
    R2_PUBLIC_URL: optionalString,
    R2_SECRET_ACCESS_KEY: optionalString,
    STRIPE_ALLOWED_PRICE_IDS: optionalString,
    STRIPE_SECRET_KEY: optionalString,
    STRIPE_WEBHOOK_SECRET: optionalString,
    TURNSTILE_SECRET_KEY: optionalString,
  })
  .superRefine((environment, context) => {
    const requireCompleteGroup = (label: string, keys: string[]) => {
      const values = keys.map(
        (key) => environment[key as keyof typeof environment],
      );
      const configured = values.filter(Boolean).length;

      if (configured > 0 && configured < keys.length) {
        context.addIssue({
          code: 'custom',
          message: `${label} must define all of: ${keys.join(', ')}`,
          path: [keys.find((key, index) => !values[index]) ?? keys[0]],
        });
      }
    };

    requireCompleteGroup('Google login', [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
    ]);
    requireCompleteGroup('Microsoft login', [
      'MICROSOFT_CLIENT_ID',
      'MICROSOFT_CLIENT_SECRET',
    ]);
    requireCompleteGroup('GitHub login', [
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
    ]);
    requireCompleteGroup('Facebook login', [
      'FACEBOOK_CLIENT_ID',
      'FACEBOOK_CLIENT_SECRET',
    ]);
    requireCompleteGroup('Stripe', [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_ALLOWED_PRICE_IDS',
    ]);
    requireCompleteGroup('Turnstile', [
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
      'TURNSTILE_SECRET_KEY',
    ]);
    requireCompleteGroup('R2 storage', [
      'R2_ENDPOINT',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET',
      'R2_PUBLIC_URL',
    ]);
    requireCompleteGroup('SES email', [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
    ]);
  });

export function validateEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> {
  if (environment.NODE_ENV !== 'production') return environment;

  const parsed = productionSchema.safeParse(environment);
  if (parsed.success) return environment;

  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'} ${issue.message}`)
    .join('; ');

  throw new Error(`Invalid production configuration: ${details}`);
}
