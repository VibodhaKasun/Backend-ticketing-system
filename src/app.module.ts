import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { EventsModule } from './gateway/events.module';

@Module({
  imports: [AuthModule, UsersModule, TicketsModule, PaymentsModule, IntegrationsModule, EventsModule, HealthModule],
  providers: [PrismaService],
})
export class AppModule {}