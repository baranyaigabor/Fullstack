'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import { LuLoaderCircle as LoaderCircleIcon } from 'react-icons/lu';

import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import Turnstile, { turnstileEnabled } from '@/components/Turnstile';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (turnstileEnabled && !captchaResponse) {
      setMessage('Please complete the security check.');
      return;
    }

    setPending(true);

    try {
      const response = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        callbackURL: '/profile',
        fetchOptions: captchaResponse
          ? { headers: { 'x-captcha-response': captchaResponse } }
          : undefined,
      });

      if (response?.error) {
        setMessage(response.error.message || 'Could not log in.');
        return;
      }

      if (!response.data?.redirect) {
        router.replace('/profile');
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setPending(false);
      if (turnstileEnabled) setCaptchaResetSignal((value) => value + 1);
    }
  };

  return (
    <Card className="w-sm border-foreground/15 bg-background">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Log in with your email and password.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <SocialAuthButtons
          disabled={pending}
          errorCallbackURL="/login"
          requestSignUp={false}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <Input
              autoComplete="email"
              disabled={pending}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Password
            <Input
              autoComplete="current-password"
              disabled={pending}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <Button
            variant="link"
            size="sm"
            className="h-auto self-end px-0"
            asChild
          >
            <Link href="/forgot-password">Forgot password?</Link>
          </Button>

          {message && (
            <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
              {message}
            </p>
          )}

          <Turnstile
            onTokenChange={setCaptchaResponse}
            resetSignal={captchaResetSignal}
          />

          <Button type="submit" disabled={pending}>
            {pending && (
              <LoaderCircleIcon
                data-icon="inline-start"
                className="animate-spin"
              />
            )}
            Log in
          </Button>
        </form>

        <Button variant="link" asChild>
          <Link href="/register">Need an account? Register</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
