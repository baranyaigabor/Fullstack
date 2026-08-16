import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEnvironment } from '../dist/config/environment.js';

const productionEnvironment = {
  NODE_ENV: 'production',
  APP_DOMAIN: 'example.com',
  BETTER_AUTH_SECRET: 'a-production-auth-secret-with-more-than-32-characters',
  BETTER_AUTH_URL: 'https://example.com/api/auth',
  CACHE_URL: 'redis://cache:6379',
  DATABASE_URL:
    'postgresql://starter:a-unique-database-password@db:5432/starter',
  RATE_LIMIT_MAX_REQUESTS: '100',
  RATE_LIMIT_WINDOW_SECONDS: '60',
  SEARCH_ENGINE_MASTER_KEY: 'a-unique-search-master-key',
  SEARCH_ENGINE_URL: 'http://search_engine:7700',
};

test('accepts a complete production environment', () => {
  assert.equal(
    validateEnvironment(productionEnvironment),
    productionEnvironment,
  );
});

test('rejects starter secrets in production', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...productionEnvironment,
        BETTER_AUTH_SECRET: 'local-development-secret-change-in-production',
        DATABASE_URL:
          'postgresql://starter:starter-local-password@db:5432/starter',
        SEARCH_ENGINE_MASTER_KEY: 'starter_dev_master_key',
      }),
    /Invalid production configuration/,
  );
});

test('rejects partially configured optional integrations', () => {
  assert.throws(
    () =>
      validateEnvironment({
        ...productionEnvironment,
        STRIPE_SECRET_KEY: 'sk_test_example',
      }),
    /Stripe must define all of/,
  );
});
