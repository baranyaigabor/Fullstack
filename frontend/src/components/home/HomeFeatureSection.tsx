'use client';

import ScrollReveal from '@/components/ScrollReveal';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { homeFeatureCards } from '@/lib/constants';

export default function HomeFeatureSection() {
  return (
    <section aria-labelledby="features-heading" className="space-y-8">
      <ScrollReveal className="max-w-2xl space-y-3">
        <h2 id="features-heading" className="text-3xl font-semibold">
          Everything a real product needs
        </h2>
        <p className="text-muted-foreground">
          Keep the reusable foundation and replace only the domain-specific
          modules for each new project.
        </p>
      </ScrollReveal>
      <div className="grid gap-4 md:grid-cols-3">
        {homeFeatureCards.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <ScrollReveal key={feature.title} delay={(index + 1) * 100}>
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-xl">
                <CardHeader>
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-secondary ${feature.tone}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
