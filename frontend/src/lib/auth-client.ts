import { createAuthClient } from 'better-auth/react';

function resolveAuthUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_AUTH_URL?.trim() || '/api/auth';

  if (/^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl;
  }

  const origin =
    typeof window === 'undefined'
      ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost'
      : window.location.origin;

  return new URL(configuredUrl, origin).toString();
}

export const authClient = createAuthClient({
  baseURL: resolveAuthUrl(),
});
