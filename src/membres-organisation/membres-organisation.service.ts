import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleInterne, StatutMembre } from '@prisma/client';

@Injectable()
export class MembresOrganisationService {
  constructor(private prisma: PrismaService) {}

  async rejoindre(adherentId: string, organisationId: string) {
    const existe = await this.prisma.membreOrganisation.findUnique({
      where: { adherentId_organisationId: { adherentId, organisationId } },
    });
    if (existe) throw new ConflictException('L\'adhérent appartient déjà à cette organisation');
    return this.prisma.membreOrganisation.create({
      data: { adherentId, organisationId },
    });
  }

  async findByOrganisation(organisationId: string, statut?: string) {
    return this.prisma.membreOrganisation.findMany({
      where: { organisationId, ...(statut ? { statut: statut as StatutMembre } : {}) },
      include: {
        adherent: {
          select: { id: true, nom: true, prenom: true, telephone: true, photoUrl: true, utilisateur: { select: { email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAdherent(adherentId: string) {
    return this.prisma.membreOrganisation.findMany({
      where: { adherentId },
      include: {
        organisation: { select: { id: true, nom: true, code: true, logoUrl: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async valider(id: string, acceptePar: string) {
    return this.prisma.membreOrganisation.update({
      where: { id },
      data: { statut: 'ACTIF', dateAcceptation: new Date(), acceptePar },
    });
  }

  async refuser(id: string, motifRefus: string) {
    return this.prisma.membreOrganisation.update({
      where: { id },
      data: { statut: 'EXCLU', motifRefus },
    });
  }

  async changerRole(id: string, roleInterne: RoleInterne) {
    const membre = await this.prisma.membreOrganisation.findUnique({ where: { id } });
    if (!membre) throw new NotFoundException('Membre introuvable');
    return this.prisma.membreOrganisation.update({
      where: { id },
      data: { roleInterne },
    });
  }

  async changerStatut(id: string, statut: StatutMembre) {
    const membre = await this.prisma.membreOrganisation.findUnique({ where: { id } });
    if (!membre) throw new NotFoundException('Membre introuvable');
    return this.prisma.membreOrganisation.update({
      where: { id },
      data: { statut },
    });
  }

  async remove(id: string) {
    return this.prisma.membreOrganisation.delete({ where: { id } });
  }
}
