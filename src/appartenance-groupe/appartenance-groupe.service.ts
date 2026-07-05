import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppartenanceGroupeService {
  constructor(private prisma: PrismaService) {}

  async findByGroupe(groupeId: string) {
    return this.prisma.appartenanceGroupe.findMany({
      where: { groupeId, actif: true },
      include: { adherent: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { dateAdhesion: 'desc' },
    });
  }

  async findByAdherent(adherentId: string) {
    return this.prisma.appartenanceGroupe.findMany({
      where: { adherentId, actif: true },
      include: { groupe: { select: { id: true, nom: true } } },
    });
  }

  async ajouter(data: { adherentId: string; groupeId: string }) {
    return this.prisma.appartenanceGroupe.upsert({
      where: { adherentId_groupeId: data },
      create: { ...data, actif: true },
      update: { actif: true },
    });
  }

  async retirer(adherentId: string, groupeId: string) {
    return this.prisma.appartenanceGroupe.update({
      where: { adherentId_groupeId: { adherentId, groupeId } },
      data: { actif: false },
    });
  }
}
