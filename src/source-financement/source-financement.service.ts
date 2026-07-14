import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SourceFinancementService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sourceFinancement.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.sourceFinancement.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.sourceFinancement.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.sourceFinancement.delete({ where: { id } });
  }
}
