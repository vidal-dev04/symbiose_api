import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { TypeDon } from '@prisma/client';

const LIBELLE_TYPE_DON: Record<TypeDon, string> = {
  ESPECE: 'en espèce',
  MOBILE_MONEY: 'par mobile money',
  NATURE: 'en nature',
};

@Injectable()
export class DonsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(data: {
    organisationId: string;
    type?: TypeDon;
    donateur?: string;
    montant?: number;
    devise?: string;
    objet?: string;
    numeroMobile?: string;
    anonyme?: boolean;
    dateDon?: string;
  }) {
    const type = data.type ?? TypeDon.ESPECE;

    const organisation = await this.prisma.organisation.findUnique({ where: { id: data.organisationId } });
    if (!organisation) throw new NotFoundException('Organisation introuvable');

    if (type === TypeDon.NATURE) {
      if (!data.objet?.trim()) throw new BadRequestException('Merci de décrire le don en nature');
    } else if (!data.montant || data.montant <= 0) {
      throw new BadRequestException('Le montant du don doit être supérieur à 0');
    }

    const don = await this.prisma.don.create({
      data: {
        organisationId: data.organisationId,
        type,
        donateur: data.donateur,
        devise: data.devise ?? 'FCFA',
        objet: data.objet,
        anonyme: data.anonyme ?? false,
        dateDon: data.dateDon ? new Date(data.dateDon) : new Date(),
        ...(data.montant ? { montant: data.montant } : {}),
        ...(type === TypeDon.MOBILE_MONEY && data.numeroMobile ? { numeroMobile: data.numeroMobile } : {}),
      },
    });

    const admins = await this.prisma.adminOrganisation.findMany({
      where: { organisationId: data.organisationId },
      select: { utilisateurId: true },
    });
    const details = type === TypeDon.NATURE
      ? data.objet
      : `${Number(don.montant)} ${don.devise}`;
    for (const admin of admins) {
      await this.notifications.create(
        admin.utilisateurId,
        'NOUVEAU_DON',
        'Nouveau don reçu 💰',
        `Un don ${LIBELLE_TYPE_DON[type]} a été déclaré${don.donateur ? ` par ${don.donateur}` : ''} : ${details}.`,
        '/dashboard/mes-dons',
      );
    }

    return don;
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
