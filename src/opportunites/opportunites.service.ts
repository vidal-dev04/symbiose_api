import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatutOpportunite, TypeOpportunite } from '@prisma/client';

interface OpportuniteInput {
  titre: string;
  organisme: string;
  description: string;
  type?: TypeOpportunite;
  secteur: string;
  paysId?: string;
  montant?: string;
  dateLimite?: string;
  lienSource?: string;
}

@Injectable()
export class OpportunitesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.opportunite.findMany({ include: { pays: true }, orderBy: { createdAt: 'desc' } });
  }

  async findPubliees() {
    return this.prisma.opportunite.findMany({
      where: { statut: StatutOpportunite.PUBLIEE },
      include: { pays: true },
      orderBy: { datePublication: 'desc' },
    });
  }

  async findOne(id: string) {
    const opportunite = await this.prisma.opportunite.findUnique({ where: { id }, include: { pays: true } });
    if (!opportunite) throw new NotFoundException('Opportunité introuvable');
    return opportunite;
  }

  async create(data: OpportuniteInput) {
    const { paysId, dateLimite, ...rest } = data;
    return this.prisma.opportunite.create({
      data: {
        ...rest,
        dateLimite: dateLimite ? new Date(dateLimite) : undefined,
        ...(paysId ? { pays: { connect: { id: paysId } } } : {}),
      },
    });
  }

  async update(id: string, data: Partial<OpportuniteInput>) {
    await this.findOne(id);
    const { paysId, dateLimite, ...rest } = data;
    return this.prisma.opportunite.update({
      where: { id },
      data: {
        ...rest,
        ...(dateLimite !== undefined ? { dateLimite: dateLimite ? new Date(dateLimite) : null } : {}),
        ...(paysId !== undefined ? { pays: paysId ? { connect: { id: paysId } } : { disconnect: true } } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.opportunite.delete({ where: { id } });
  }
}
