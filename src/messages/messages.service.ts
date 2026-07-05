import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async envoyer(data: {
    expediteurId: string;
    destinataireId: string;
    organisationId: string;
    sujet: string;
    contenu: string;
  }) {
    const message = await this.prisma.message.create({
      data: {
        expediteurId: data.expediteurId,
        destinataireId: data.destinataireId,
        organisationId: data.organisationId,
        sujet: data.sujet,
        contenu: data.contenu,
      },
      include: {
        expediteur: { select: { email: true } },
      },
    });

    await this.notifications.create(
      data.destinataireId,
      'NOUVEAU_MESSAGE',
      `Nouveau message : ${data.sujet} ✉️`,
      `Vous avez reçu un message de ${message.expediteur.email}.`,
      '/dashboard/messages',
    );

    return message;
  }

  async recus(utilisateurId: string) {
    return this.prisma.message.findMany({
      where: { destinataireId: utilisateurId },
      include: {
        expediteur: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async envoyes(utilisateurId: string) {
    return this.prisma.message.findMany({
      where: { expediteurId: utilisateurId },
      include: {
        destinataire: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, utilisateurId: string) {
    const msg = await this.prisma.message.findUnique({
      where: { id },
      include: {
        expediteur: { select: { email: true } },
        destinataire: { select: { email: true } },
      },
    });
    if (!msg) throw new NotFoundException('Message introuvable');

    if (msg.destinataireId === utilisateurId && !msg.lu) {
      await this.prisma.message.update({ where: { id }, data: { lu: true } });
    }

    return msg;
  }

  async countNonLus(utilisateurId: string) {
    const count = await this.prisma.message.count({
      where: { destinataireId: utilisateurId, lu: false },
    });
    return { count };
  }

  async membres(organisationId: string, excluId: string) {
    return this.prisma.utilisateur.findMany({
      where: {
        adminOrgs: { some: { organisationId } },
        id: { not: excluId },
      },
      select: { id: true, email: true, adherent: { select: { nom: true, prenom: true } } },
    });
  }
}
