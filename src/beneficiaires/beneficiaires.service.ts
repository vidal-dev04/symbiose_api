import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BeneficiairesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    adherentId: string;
    nom: string;
    prenom: string;
    lienParente?: string;
    dateNaissance?: string;
    telephone?: string;
  }) {
    return this.prisma.beneficiaire.create({
      data: {
        ...data,
        dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : null,
      },
    });
  }

  async findByAdherent(adherentId: string) {
    return this.prisma.beneficiaire.findMany({
      where: { adherentId },
      orderBy: [{ nom: 'asc' }],
    });
  }

  async findAllByOrg(organisationId: string) {
    return this.prisma.beneficiaire.findMany({
      where: { adherent: { organisationId } },
      include: { adherent: { select: { nom: true, prenom: true } } },
      orderBy: [{ nom: 'asc' }],
    });
  }

  async findOne(id: string) {
    const b = await this.prisma.beneficiaire.findUnique({ where: { id } });
    if (!b) throw new NotFoundException('Bénéficiaire introuvable');
    return b;
  }

  async update(id: string, data: { nom?: string; prenom?: string; lienParente?: string; telephone?: string }) {
    return this.prisma.beneficiaire.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.beneficiaire.delete({ where: { id } });
  }
}
