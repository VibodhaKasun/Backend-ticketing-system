import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TicketsService } from '../tickets/tickets.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private prisma: PrismaService, private tickets: TicketsService) {}

  // Example webhook from WhatsApp provider: converts incoming message to ticket (or append to existing)
  @Post('whatsapp')
  async whatsappWebhook(@Body() body: any) {
    // body: { from, message, messageId }
    const email = body.from + '@whatsapp.local'; // synthetic
    const customer = await this.prisma.customer.upsert({
      where: { email },
      update: {},
      create: { name: body.from, email, phone: body.from }
    });

    // create a ticket (or find and append) - simple create:
    const ticket = await this.tickets.create({
      title: `WhatsApp message from ${body.from}`,
      description: body.message,
      priority: 'MEDIUM',
      source: 'WHATSAPP',
      customer: { name: customer.name, email: customer.email, phone: customer.phone }
    });

    // save raw communication
    await this.prisma.communication.create({ data: { ticketId: ticket.id, channel: 'WHATSAPP', sourceId: body.messageId, payload: JSON.stringify(body) } });

    return { ok: true, ticketId: ticket.id };
  }

  // email, call transcriptions, etc. can be similar endpoints
}