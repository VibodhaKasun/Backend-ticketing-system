import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../gateway/events.gateway';
import { Prisma } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService, private events: EventsGateway) {}

  async create(dto: any) {
    // find or create customer by email
    let customer = await this.prisma.customer.findUnique({ where: { email: dto.customer.email }});
    if (!customer) {
      customer = await this.prisma.customer.create({ data: dto.customer });
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
        source: dto.source ?? 'WEBSITE',
        customerId: customer.id,
      },
      include: { customer: true }
    });

    await this.prisma.ticketHistory.create({
      data: { ticketId: ticket.id, action: 'CREATED', actorId: dto.actorId ?? null }
    });

    this.events.server.emit('ticketCreated', ticket);
    return ticket;
  }

  findAll() {
    return this.prisma.ticket.findMany({ 
      include: { 
        customer: true, 
        comments: true, 
        attachments: true 
      }
    });
  }

  findOne(id: string) {
    return this.prisma.ticket.findUnique({ 
      where: { id }, 
      include: { 
        customer: true, 
        comments: true, 
        attachments: true, 
        history: true 
      }
    });
  }

  async assign(ticketId: string, agentId: string) {
    const t = await this.prisma.ticket.update({ 
      where: { id: ticketId }, 
      data: { 
        assignedToId: agentId, 
        status: 'IN_PROGRESS' 
      }
    });
    
    await this.prisma.ticketHistory.create({ 
      data: { 
        ticketId, 
        action: 'ASSIGNED', 
        actorId: agentId 
      }
    });
    
    this.events.server.emit('ticketAssigned', t);
    return t;
  }

  async hold(ticketId: string, userId: string, reason?: string) {
    const t = await this.prisma.ticket.update({ 
      where: { id: ticketId }, 
      data: { 
        status: 'HOLD', 
        holdReason: reason ?? null, 
        heldById: userId 
      }
    });
    
    await this.prisma.ticketHistory.create({ 
      data: { 
        ticketId, 
        action: 'HOLD', 
        actorId: userId, 
        metadata: reason 
      }
    });
    
    this.events.server.emit('ticketHeld', t);
    return t;
  }

  async resume(ticketId: string, userId: string) {
    const t = await this.prisma.ticket.update({ 
      where: { id: ticketId }, 
      data: { 
        status: 'IN_PROGRESS', 
        holdReason: null, 
        heldById: null 
      }
    });
    
    await this.prisma.ticketHistory.create({ 
      data: { 
        ticketId, 
        action: 'RESUME', 
        actorId: userId 
      }
    });
    
    this.events.server.emit('ticketResumed', t);
    return t;
  }

  async updateStatus(ticketId: string, status: string, userId?: string) {
    // Validate that status is a valid TicketStatus enum value
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'HOLD', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid ticket status: ${status}. Valid values are: ${validStatuses.join(', ')}`);
    }

    const t = await this.prisma.ticket.update({ 
      where: { id: ticketId }, 
      data: { status: status as any }
    });
    
    await this.prisma.ticketHistory.create({ 
      data: { 
        ticketId, 
        action: `STATUS_${status}`, 
        actorId: userId ?? null 
      }
    });
    
    this.events.server.emit('ticketUpdated', t);
    return t;
  }

  async addComment(ticketId: string, authorId: string | null, content: string, isPublic = true) {
    const comment = await this.prisma.comment.create({ 
      data: { 
        ticketId, 
        authorId: authorId ?? undefined, 
        content, 
        public: isPublic 
      }
    });
    
    this.events.server.emit('commentAdded', { ticketId, comment });
    return comment;
  }
}