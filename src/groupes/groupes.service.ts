import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { organisationId: string; nom: string; description?: string }) {
    return this.prisma.groupeAdherent.create({ data });
  }

  async findAll(organisationId: string) {
    return this.prisma.groupeAdherent.findMany({
      where: { organisationId },
      include: {
        _count: { select: { membres: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const g = await this.prisma.groupeAdherent.findUnique({
      where: { id },
      include: {
        membres: {
          include: {
            adherent: {
              select: { nom: true, prenom: true, utilisateur: { select: { email: true } } },
            },
          },
        },
      },
    });
    if (!g) throw new NotFoundException('Groupe introuvable');
    return g;
  }

  async update(id: string, data: { nom?: string; description?: string }) {
    return this.prisma.groupeAdherent.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.groupeAdherent.delete({ where: { id } });
  }

  async ajouterMembre(groupeId: string, adherentId: string) {
    const existing = await this.prisma.appartenanceGroupe.findFirst({ where: { groupeId, adherentId } });
    if (existing) throw new ConflictException('Déjà membre de ce groupe');
    return this.prisma.appartenanceGroupe.create({ data: { groupeId, adherentId } });
  }

  async retirerMembre(groupeId: string, adherentId: string) {
    await this.prisma.appartenanceGroupe.deleteMany({ where: { groupeId, adherentId } });
    return { success: true };
  }

  async mesGroupes(adherentId: string) {
    const apps = await this.prisma.appartenanceGroupe.findMany({
      where: { adherentId },
      include: { groupe: true },
    });
    return apps.map((a: any) => a.groupe);
  }
}
