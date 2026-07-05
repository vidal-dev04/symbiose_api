import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DonsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    organisationId: string;
    donateur?: string;
    montant: number;
    devise?: string;
    objet?: string;
    anonyme?: boolean;
    dateDon?: string;
  }) {
    return this.prisma.don.create({
      data: {
        ...data,
        devise: data.devise ?? 'FCFA',
        dateDon: data.dateDon ? new Date(data.dateDon) : new Date(),
      },
    });
  }

  async findAll(organisationId: string) {
    return this.prisma.don.findMany({
      where: { organisationId },
      orderBy: { dateDon: 'desc' },
    });
  }

  async findOne(id: string) {
    const don = await this.prisma.don.findUnique({ where: { id } });
    if (!don) throw new NotFoundException('Don introuvable');
    return don;
  }

  async remove(id: string) {
    return this.prisma.don.delete({ where: { id } });
  }

  async stats(organisationId: string) {
    const [total, parMois] = await Promise.all([
      this.prisma.don.aggregate({
        _sum: { montant: true },
        _count: true,
        where: { organisationId },
      }),
      this.prisma.don.groupBy({
        by: ['dateDon'],
        _sum: { montant: true },
        where: { organisationId },
        orderBy: { dateDon: 'desc' },
        take: 12,
      }),
    ]);
    return {
      totalMontant: total._sum.montant ?? 0,
      totalDons: total._count,
      parMois,
    };
  }
}
