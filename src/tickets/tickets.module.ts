import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { PrismaService } from '../prisma.service';
import { EventsModule } from '../gateway/events.module';

@Module({
  imports: [EventsModule],
  providers: [TicketsService, PrismaService],
  controllers: [TicketsController],
})
export class TicketsModule {}