import { Controller, Post, Body, Req, HttpCode, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('create-intent')
  async createIntent(@Req() req: any, @Body() body: { amount: number; ticketId?: string; userId?: string }) {
    // assume req.user exists (protect with JWT in frontends)
    const userId = req.user?.id ?? body.userId;
    if (!userId) throw new BadRequestException('User id missing');
    return this.payments.createIntent(userId, body.amount, body.ticketId);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: any) {
    const sig = req.headers['stripe-signature'] as string;
    try {
      const event = this.payments.constructEvent(req['rawBody'], sig);
      return this.payments.handleWebhook(event);
    } catch (err) {
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}