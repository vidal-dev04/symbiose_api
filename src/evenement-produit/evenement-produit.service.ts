import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvenementProduitService {
  constructor(private prisma: PrismaService) {}

  async findByEvenement(evenementId: string) {
    return this.prisma.evenementProduit.findMany({
      where: { evenementId },
      include: { adherent: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByAdherent(adherentId: string) {
    return this.prisma.evenementProduit.findMany({
      where: { adherentId },
      include: { evenement: { select: { id: true, titre: true, dateDebut: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async inscrire(data: { evenementId: string; adherentId: string }) {
    return this.prisma.evenementProduit.upsert({
      where: { evenementId_adherentId: data },
      create: { ...data, statut: 'INSCRIT' },
      update: { statut: 'INSCRIT' },
    });
  }

  async annuler(evenementId: string, adherentId: string) {
    return this.prisma.evenementProduit.update({
      where: { evenementId_adherentId: { evenementId, adherentId } },
      data: { statut: 'ANNULE' },
    });
  }
}
