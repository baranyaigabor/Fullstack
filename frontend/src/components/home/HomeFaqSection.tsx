'use client';

import ScrollReveal from '@/components/ScrollReveal';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { faqItems } from '@/lib/constants';

export default function HomeFaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="space-y-6">
      <ScrollReveal className="max-w-2xl space-y-3">
        <h2 id="faq-heading" className="text-3xl font-semibold">
          FAQ
        </h2>
        <p className="text-muted-foreground">
          The most important decisions before turning this starter into your own
          application.
        </p>
      </ScrollReveal>
      <div className="grid gap-4 md:grid-cols-3">
        {faqItems.map((item, index) => (
          <ScrollReveal key={item.question} delay={index * 100}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{item.question}</CardTitle>
                <CardDescription>{item.answer}</CardDescription>
              </CardHeader>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
