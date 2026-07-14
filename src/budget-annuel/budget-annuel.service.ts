import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetAnnuelService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.budgetAnnuel.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.budgetAnnuel.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.budgetAnnuel.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.budgetAnnuel.delete({ where: { id } });
  }
}
