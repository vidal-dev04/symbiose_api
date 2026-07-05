import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EvenementsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(data: {
    organisationId: string;
    titre: string;
    description?: string;
    lieu?: string;
    dateDebut: string;
    dateFin?: string;
    capacite?: number;
    publie?: boolean;
  }) {
    const evenement = await this.prisma.evenement.create({
      data: {
        ...data,
        dateDebut: new Date(data.dateDebut),
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
      },
    });

    const adherents = await this.prisma.adherent.findMany({
      where: { organisationId: data.organisationId, statut: 'ACTIF' },
      select: { utilisateurId: true },
    });

    await Promise.all(
      adherents.map(a =>
        this.notifications.create(
          a.utilisateurId,
          'NOUVEL_EVENEMENT',
          `Nouvel événement : ${data.titre} 📅`,
          `Un nouvel événement a été organisé. Date : ${new Date(data.dateDebut).toLocaleDateString('fr-FR')}.`,
          '/dashboard/mes-evenements',
        ),
      ),
    );

    return evenement;
  }

  async findAll(organisationId: string) {
    return this.prisma.evenement.findMany({
      where: { organisationId },
      include: {
        _count: { select: { participations: true } },
      },
      orderBy: { dateDebut: 'asc' },
    });
  }

  async findOne(id: string) {
    const e = await this.prisma.evenement.findUnique({
      where: { id },
      include: {
        participations: {
          include: {
            adherent: {
              select: { nom: true, prenom: true, utilisateur: { select: { email: true } } },
            },
          },
        },
        _count: { select: { participations: true } },
      },
    });
    if (!e) throw new NotFoundException('Événement introuvable');
    return e;
  }

  async update(id: string, data: any) {
    return this.prisma.evenement.update({
      where: { id },
      data: {
        ...data,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
        dateFin: data.dateFin ? new Date(data.dateFin) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.evenement.delete({ where: { id } });
  }

  async participer(evenementId: string, adherentId: string) {
    const evenement = await this.prisma.evenement.findUnique({
      where: { id: evenementId },
      include: { _count: { select: { participations: true } } },
    });
    if (!evenement) throw new NotFoundException('Événement introuvable');

    if (evenement.capacite && (evenement as any)._count?.participations >= evenement.capacite) {
      throw new ConflictException('Capacité maximale atteinte');
    }

    const existing = await this.prisma.evenementProduit.findFirst({
      where: { evenementId, adherentId },
    });
    if (existing) throw new ConflictException('Déjà inscrit à cet événement');

    return this.prisma.evenementProduit.create({
      data: { evenementId, adherentId },
    });
  }

  async seDesinscrire(evenementId: string, adherentId: string) {
    await this.prisma.evenementProduit.deleteMany({
      where: { evenementId, adherentId },
    });
    return { success: true };
  }

  async mesEvenements(adherentId: string) {
    const participations = await this.prisma.evenementProduit.findMany({
      where: { adherentId },
      include: {
        evenement: {
          include: { _count: { select: { participations: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return participations.map((p: any) => ({ ...p.evenement, inscrit: true }));
  }

  async evenementsPublics(organisationId: string) {
    return this.prisma.evenement.findMany({
      where: { organisationId, publie: true },
      include: { _count: { select: { participations: true } } },
      orderBy: { dateDebut: 'asc' },
    });
  }
}
