import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdherentsService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {}

  private generatePassword(length = 10): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async create(data: any) {
    const org = await this.prisma.organisation.findUnique({ where: { id: data.organisationId } });
    if (!org) throw new NotFoundException('Organisation introuvable');

    const emailAdherent = data.email;
    if (!emailAdherent) throw new BadRequestException('Email requis');

    const existing = await this.prisma.utilisateur.findUnique({ where: { email: emailAdherent } });
    if (existing) throw new ConflictException('Un compte avec cet email existe déjà');

    const motDePasse = this.generatePassword();
    const hash = await bcrypt.hash(motDePasse, 12);

    const { email: _email, ...adherentData } = data;

    const result = await this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: { email: emailAdherent, motDePasse: hash, role: 'ADHERENT', actif: true },
      });
      const adherent = await tx.adherent.create({
        data: { ...adherentData, utilisateurId: utilisateur.id },
      });
      await tx.membreOrganisation.create({
        data: { adherentId: adherent.id, organisationId: data.organisationId, statut: 'EN_ATTENTE' },
      });
      return { adherent, utilisateur };
    });

    await this.email.sendInscriptionAdherent(emailAdherent, org.nom, motDePasse);

    return result.adherent;
  }

  async findAll() {
    return this.prisma.adherent.findMany({
      include: { utilisateur: { select: { email: true } }, organisation: { select: { id: true, nom: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOrganisation(organisationId: string) {
    return this.prisma.adherent.findMany({
      where: { organisationId },
      include: {
        utilisateur: { select: { email: true } },
        ville: true,
        membres: {
          where: { organisationId },
          select: { id: true, statut: true, roleInterne: true, dateAcceptation: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const adherent = await this.prisma.adherent.findUnique({
      where: { id },
      include: { utilisateur: { select: { email: true } }, ville: true, organisation: true },
    });
    if (!adherent) throw new NotFoundException('Adhérent introuvable');
    return adherent;
  }

  async valider(id: string) {
    const adherent = await this.findOne(id);
    if (adherent.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cet adhérent a déjà été traité');
    }

    const updated = await this.prisma.adherent.update({
      where: { id },
      data: { statut: 'VALIDE', dateValidation: new Date() },
    });

    await this.prisma.membreOrganisation.upsert({
      where: { adherentId_organisationId: { adherentId: id, organisationId: adherent.organisationId } },
      create: { adherentId: id, organisationId: adherent.organisationId, statut: 'ACTIF', dateAcceptation: new Date() },
      update: { statut: 'ACTIF', dateAcceptation: new Date() },
    });

    const tarifMensuel = this.config.get('TARIF_MENSUEL', 16500);
    const token = uuid();
    await this.prisma.tokenPaiement.create({
      data: {
        token,
        email: adherent.utilisateur.email,
        organisationId: adherent.organisationId,
        adherentId: adherent.id,
        montant: tarifMensuel,
        periode: 'MOIS',
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.email.sendAdhesionValidee(
      adherent.utilisateur.email,
      adherent.organisation.nom,
      token,
      tarifMensuel,
    );

    await this.notifications.create(
      adherent.utilisateurId,
      'ADHESION_VALIDEE',
      'Adhésion validée ✅',
      `Votre adhésion à "${adherent.organisation.nom}" a été validée. Consultez votre email pour payer votre cotisation.`,
      '/dashboard/mon-adhesion',
    );

    return updated;
  }

  async refuser(id: string, motif: string) {
    const adherent = await this.findOne(id);
    if (adherent.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cet adhérent a déjà été traité');
    }
    const updated = await this.prisma.adherent.update({
      where: { id },
      data: { statut: 'REFUSE', motifRefus: motif },
    });
    await this.email.sendAdhesionRefusee(
      adherent.utilisateur.email,
      adherent.organisation.nom,
      motif,
    );

    await this.notifications.create(
      adherent.utilisateurId,
      'ADHESION_REFUSEE',
      'Adhésion refusée ❌',
      `Votre demande d'adhésion à "${adherent.organisation.nom}" a été refusée. Motif : ${motif}`,
    );

    return updated;
  }
}
