import { Controller, Post, Body, UseGuards, Req, Get, Param, Patch } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private svc: TicketsService) {}

  @Post()
  async create(@Body() body: any) {
    // body.customer: {name, email, phone}
    return this.svc.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN','AGENT')
  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body('agentId') agentId: string, @Req() req) {
    return this.svc.assign(id, agentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN','AGENT')
  @Patch(':id/hold')
  hold(@Param('id') id: string, @Body('reason') reason: string, @Req() req) {
    return this.svc.hold(id, req.user.id, reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN','AGENT')
  @Patch(':id/resume')
  resume(@Param('id') id: string, @Req() req) {
    return this.svc.resume(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN','AGENT')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @Req() req) {
    return this.svc.updateStatus(id, status, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  addComment(@Param('id') id: string, @Body() body: { content: string; public?: boolean }, @Req() req) {
    return this.svc.addComment(id, req.user?.id ?? null, body.content, body.public ?? true);
  }
}