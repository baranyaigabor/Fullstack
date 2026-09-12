import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { CheckoutSession } from '@fullstack-starter/shared';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private client?: Stripe;

  createCheckoutSession(input: CheckoutSession, customerEmail: string) {
    const allowedPriceIds = new Set(
      (process.env.STRIPE_ALLOWED_PRICE_IDS || '')
        .split(',')
        .map((priceId) => priceId.trim())
        .filter(Boolean),
    );

    if (!allowedPriceIds.has(input.priceId)) {
      throw new BadRequestException('Invalid checkout price');
    }

    const origin = this.getApplicationOrigin();

    return this.getClient().checkout.sessions.create({
      cancel_url: `${origin}/profile?checkout=cancelled`,
      customer_email: customerEmail,
      line_items: [
        {
          price: input.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/profile?checkout=success`,
    });
  }

  constructWebhookEvent(payload: Buffer | string, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new ServiceUnavailableException(
        'Stripe webhooks are not configured',
      );
    }

    return this.getClient().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  handleWebhookEvent(event: { type: string }) {
    switch (event.type) {
      case 'checkout.session.completed':
        break;
      default:
        break;
    }
  }

  private getClient(): Stripe {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('Stripe is not configured');
    }

    this.client ??= new Stripe(apiKey);
    return this.client;
  }

  private getApplicationOrigin(): string {
    const appDomain = process.env.APP_DOMAIN?.trim();
    if (appDomain) {
      return `https://${appDomain}`;
    }

    const authUrl = process.env.BETTER_AUTH_URL;
    if (!authUrl) {
      throw new ServiceUnavailableException(
        'Application URL is not configured',
      );
    }

    return new URL(authUrl).origin;
  }
}
