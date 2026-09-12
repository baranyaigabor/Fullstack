'use client';

import Link from 'next/link';
import type { SubmitEvent } from 'react';
import { useState } from 'react';
import { LuLoaderCircle as LoaderCircleIcon } from 'react-icons/lu';

import { Button } from '@/components/ui/button';
import Turnstile, { turnstileEnabled } from '@/components/Turnstile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { requestPasswordReset } from '@/lib/api/auth';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [captchaResponse, setCaptchaResponse] = useState<string | null>(null);
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    setMessage(null);

    if (turnstileEnabled && !captchaResponse) {
      setMessage('Please complete the security check.');
      return;
    }

    setPending(true);

    try {
      const response = await requestPasswordReset(
        {
          email: normalizedEmail,
          redirectTo: '/reset-password',
        },
        captchaResponse,
      );

      if (!response.ok) {
        setMessage('Could not send reset instructions. Please try again.');
        return;
      }

      setMessage('If an account exists, reset instructions are on the way.');
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
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your email and we will send you a reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
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
            Send reset link
          </Button>
        </form>

        <Button variant="link" asChild>
          <Link href="/login">Back to log in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
