import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { StatutOpportunite } from '@prisma/client';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async desactiverAbonnementsExpires() {
    this.logger.log('Vérification des abonnements expirés...');

    const expires = await this.prisma.abonnement.findMany({
      where: {
        dateFin: { lte: new Date() },
        statut: { in: ['ACTIF', 'ESSAI'] },
      },
      include: { organisation: true },
    });

    for (const abo of expires) {
      await this.prisma.$transaction([
        this.prisma.abonnement.update({
          where: { id: abo.id },
          data: { statut: 'EXPIRE' },
        }),
        this.prisma.organisation.update({
          where: { id: abo.organisationId },
          data: { statut: 'INACTIVE' },
        }),
      ]);
      this.logger.warn(`Abonnement expiré pour ${abo.organisation.nom} (${abo.organisation.code})`);
    }

    this.logger.log(`${expires.length} abonnement(s) expiré(s) traité(s).`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async desactiverEssaisExpires() {
    this.logger.log('Vérification des essais expirés...');

    const essais = await this.prisma.abonnement.findMany({
      where: {
        statut: 'ESSAI',
        essaiExpiration: { lte: new Date() },
      },
      include: { organisation: true },
    });

    for (const abo of essais) {
      await this.prisma.$transaction([
        this.prisma.abonnement.update({
          where: { id: abo.id },
          data: { statut: 'EXPIRE' },
        }),
        this.prisma.organisation.update({
          where: { id: abo.organisationId },
          data: { statut: 'INACTIVE' },
        }),
      ]);
      this.logger.warn(`Essai expiré pour ${abo.organisation.nom}`);
    }

    this.logger.log(`${essais.length} essai(s) expiré(s) traité(s).`);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async publierProchaineOpportunite() {
    const prochaine = await this.prisma.opportunite.findFirst({
      where: { statut: StatutOpportunite.BROUILLON },
      orderBy: { createdAt: 'asc' },
    });

    if (!prochaine) return;

    await this.prisma.opportunite.update({
      where: { id: prochaine.id },
      data: { statut: StatutOpportunite.PUBLIEE, datePublication: new Date() },
    });

    this.logger.log(`Opportunité publiée automatiquement : "${prochaine.titre}"`);
  }
}
