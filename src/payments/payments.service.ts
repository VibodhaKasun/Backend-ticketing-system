import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-09-30.clover' });
  }

  async createIntent(userId: string, amountCents: number, ticketId?: string) {
    const intent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      metadata: { userId, ...(ticketId && { ticketId }) }
    });
    await this.prisma.payment.create({
      data: { userId, amount: amountCents, stripeIntent: intent.id, ...(ticketId && { ticketId }) }
    });
    return { clientSecret: intent.client_secret };
  }

  constructEvent(rawBody: Buffer, sig: string) {
    return this.stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  }

  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      await this.prisma.payment.updateMany({
        where: { stripeIntent: pi.id },
        data: { status: 'SUCCEEDED' }
      });
    }
    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object as Stripe.PaymentIntent;
      await this.prisma.payment.updateMany({
        where: { stripeIntent: pi.id },
        data: { status: 'FAILED' }
      });
    }
    return { received: true };
  }
}