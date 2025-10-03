import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { PrismaService } from '../prisma.service';
import { TicketsService } from '../tickets/tickets.service';
import { EventsModule } from '../gateway/events.module';

@Module({
  imports: [EventsModule],
  controllers: [IntegrationsController],
  providers: [PrismaService, TicketsService],
})
export class IntegrationsModule {}