'use client';

import Link from 'next/link';
import { LuArrowRight, LuCheck } from 'react-icons/lu';

import ScrollReveal from '@/components/ScrollReveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import {
  heroIcon as HeroIcon,
  primaryAction,
  secondaryAction,
  siteDescription,
  siteName,
  starterHighlights,
} from '@/lib/constants';

export default function HomeHeroSection() {
  return (
    <section className="grid min-h-[60dvh] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="max-w-2xl space-y-7">
        <div className="space-y-5">
          <ScrollReveal delay={100}>
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
              <HeroIcon className="h-4 w-4" /> Ready for your next product
            </p>
            <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
              Start with the product, not the plumbing.
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              {siteDescription}
            </p>
          </ScrollReveal>
        </div>
        <ScrollReveal delay={300} className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={primaryAction.href}
            className={buttonVariants({ size: 'lg' })}
          >
            {primaryAction.label}
            <LuArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={secondaryAction.href}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            {secondaryAction.label}
          </Link>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={200} className="relative mx-auto w-full max-w-md">
        <Card className="border-primary/20 bg-card/80 shadow-2xl backdrop-blur">
          <CardHeader>
            <CardTitle>{siteName}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {starterHighlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="rounded-full bg-primary/10 p-1 text-primary">
                  <LuCheck className="h-4 w-4" />
                </span>
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </ScrollReveal>
    </section>
  );
}
