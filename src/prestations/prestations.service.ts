import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrestationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    organisationId: string;
    libelle: string;
    description?: string;
    montantMax?: number;
    conditions?: string;
    actif?: boolean;
  }) {
    return this.prisma.prestation.create({
      data: { ...data, actif: data.actif ?? true },
    });
  }

  async findAll(organisationId: string, actif?: boolean) {
    return this.prisma.prestation.findMany({
      where: { organisationId, ...(actif !== undefined ? { actif } : {}) },
      orderBy: { libelle: 'asc' },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.prestation.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Prestation introuvable');
    return p;
  }

  async update(id: string, data: any) {
    return this.prisma.prestation.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.prestation.delete({ where: { id } });
  }
}
