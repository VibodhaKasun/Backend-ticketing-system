import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, name: true, role: true }});
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }});
  }
}