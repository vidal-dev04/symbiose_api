import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DomainesInterventionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.domaineIntervention.findMany({ orderBy: { libelle: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.domaineIntervention.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.domaineIntervention.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.domaineIntervention.delete({ where: { id } });
  }
}
