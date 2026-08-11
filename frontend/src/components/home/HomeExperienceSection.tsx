'use client';

import ScrollReveal from '@/components/ScrollReveal';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { homeExperienceCards } from '@/lib/constants';

export default function HomeExperienceSection() {
  return (
    <section
      aria-labelledby="experience-heading"
      className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"
    >
      <ScrollReveal>
        <Card className="h-full bg-background text-foreground">
          <CardHeader>
            <CardTitle
              id="experience-heading"
              className="text-3xl leading-tight"
            >
              A foundation designed to be changed.
            </CardTitle>
            <CardDescription className="text-foreground/75">
              The starter keeps infrastructure concerns isolated so product code
              can remain small and easy to replace.
            </CardDescription>
          </CardHeader>
        </Card>
      </ScrollReveal>

      <div className="grid gap-4 sm:grid-cols-3">
        {homeExperienceCards.map((item, index) => {
          const Icon = item.icon;

          return (
            <ScrollReveal key={item.title} delay={(index + 2) * 100}>
              <Card className="h-full">
                <CardHeader>
                  <Icon className="h-5 w-5 text-blue-500" />
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
