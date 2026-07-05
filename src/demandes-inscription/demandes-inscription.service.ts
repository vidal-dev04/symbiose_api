import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DemandesInscriptionService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    organisationId?: string;
    adherentId?: string;
    type: string;
    donneesJson?: any;
  }) {
    return this.prisma.demandeInscription.create({ data });
  }

  async findAll(organisationId: string, statut?: string) {
    return this.prisma.demandeInscription.findMany({
      where: { organisationId, ...(statut ? { statut } : {}) },
      include: {
        adherent: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAdherent(adherentId: string) {
    return this.prisma.demandeInscription.findMany({
      where: { adherentId },
      include: { organisation: { select: { id: true, nom: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const d = await this.prisma.demandeInscription.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Demande introuvable');
    return d;
  }

  async accepter(id: string, traitePar: string) {
    await this.findOne(id);
    return this.prisma.demandeInscription.update({
      where: { id },
      data: { statut: 'ACCEPTE', traitePar, dateTraitement: new Date() },
    });
  }

  async refuser(id: string, motif: string, traitePar: string) {
    await this.findOne(id);
    return this.prisma.demandeInscription.update({
      where: { id },
      data: { statut: 'REFUSE', motif, traitePar, dateTraitement: new Date() },
    });
  }
}
