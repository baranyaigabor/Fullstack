'use client';

import {
  PublicConfigSchema,
  type SocialProvider,
} from '@fullstack-starter/shared';
import { useEffect, useState } from 'react';
import { FaFacebook, FaGithub, FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { LuLoaderCircle as LoaderCircleIcon } from 'react-icons/lu';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';

const providerDetails = {
  google: { icon: FaGoogle, label: 'Google' },
  microsoft: { icon: FaMicrosoft, label: 'Microsoft' },
  github: { icon: FaGithub, label: 'GitHub' },
  facebook: { icon: FaFacebook, label: 'Facebook' },
} satisfies Record<SocialProvider, { icon: typeof FaGoogle; label: string }>;

type SocialAuthButtonsProps = {
  disabled?: boolean;
  errorCallbackURL: '/login' | '/register';
  requestSignUp: boolean;
};

export default function SocialAuthButtons({
  disabled,
  errorCallbackURL,
  requestSignUp,
}: SocialAuthButtonsProps) {
  const [providers, setProviders] = useState<SocialProvider[]>([]);
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetch('/api/config', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: unknown) => {
        const parsed = PublicConfigSchema.safeParse(data);
        if (parsed.success) setProviders(parsed.data.socialProviders);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const handleSocialAuth = async (provider: SocialProvider) => {
    setPendingProvider(provider);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: '/profile',
        errorCallbackURL,
        requestSignUp,
      });
    } finally {
      setPendingProvider(null);
    }
  };

  if (providers.length === 0) return null;

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 gap-2">
        {providers.map((provider) => {
          const { icon: Icon, label } = providerDetails[provider];
          const isPending = pendingProvider === provider;

          return (
            <Button
              key={provider}
              type="button"
              variant="outline"
              className="h-12"
              disabled={disabled || Boolean(pendingProvider)}
              onClick={() => handleSocialAuth(provider)}
            >
              {isPending ? (
                <LoaderCircleIcon
                  data-icon="inline-start"
                  className="animate-spin"
                />
              ) : (
                <Icon data-icon="inline-start" />
              )}
              {label}
            </Button>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>OR</span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
