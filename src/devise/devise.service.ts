import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeviseService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.devise.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; nom: string; symbole?: string }) {
    return this.prisma.devise.create({ data });
  }

  async update(id: string, data: { nom?: string; symbole?: string; actif?: boolean }) {
    return this.prisma.devise.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.devise.delete({ where: { id } });
  }
}
