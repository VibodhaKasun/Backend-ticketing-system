import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email already registered');
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({ data: { email, password: hashed, name, role: 'AGENT' }});
    const token = this.jwt.sign({ sub: user.id, role: user.role, email: user.email });
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
  }

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new BadRequestException('Invalid credentials');
    const token = this.jwt.sign({ sub: user.id, role: user.role, email: user.email });
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
  }
}