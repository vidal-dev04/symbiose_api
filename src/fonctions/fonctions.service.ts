import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FonctionsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    organisationId: string;
    libelle: string;
    description?: string;
  }) {
    return this.prisma.fonction.create({ data });
  }

  async findAll(organisationId: string) {
    return this.prisma.fonction.findMany({
      where: { organisationId },
      include: {
        occupations: {
          where: { actif: true },
          include: { adherent: { select: { nom: true, prenom: true } } },
        },
      },
      orderBy: { libelle: 'asc' },
    });
  }

  async update(id: string, data: { libelle?: string; description?: string; actif?: boolean }) {
    return this.prisma.fonction.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.fonction.delete({ where: { id } });
  }
}
