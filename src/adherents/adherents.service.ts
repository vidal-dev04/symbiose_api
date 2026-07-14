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

  private mapTypePiece(value: string): string {
    const map: Record<string, string> = {
      "CNI (Carte Nationale d'Identité)": 'CNI',
      'Passeport': 'PASSEPORT',
      'Permis de conduire': 'PERMIS',
      'Carte de résident': 'CARTE_RESIDENT',
      'Autre': 'AUTRE',
    };
    return map[value] ?? value;
  }

  private generatePassword(length = 10): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private async generateNumero(): Promise<string> {
    const annee = new Date().getFullYear();
    const count = await this.prisma.adherent.count();
    return `ADH-${annee}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(data: any) {
    const org = await this.prisma.organisation.findUnique({ where: { id: data.organisationId } });
    if (!org) throw new NotFoundException('Organisation introuvable');

    const emailAdherent = data.email;
    if (!emailAdherent) throw new BadRequestException('Email requis');

    const existing = await this.prisma.utilisateur.findUnique({ where: { email: emailAdherent } });
    if (existing) throw new ConflictException('Un compte avec cet email existe déjà');

    // Resolve villeId from ville name + pays code
    let villeId: string | undefined;
    if (data.ville && data.pays) {
      const villeObj = await this.prisma.ville.findFirst({
        where: { nom: { equals: data.ville, mode: 'insensitive' }, pays: { code: data.pays } },
      });
      if (villeObj) villeId = villeObj.id;
    }

    const adherentData: any = {
      organisationId: data.organisationId,
      nom: data.nom,
      prenom: data.prenom,
      ...(data.dateNaissance ? { dateNaissance: new Date(data.dateNaissance) } : {}),
      ...(data.sexe ? { genre: data.sexe } : {}),
      telephone: data.telephone,
      ...(data.photoUrl ? { photoUrl: data.photoUrl } : {}),
      ...(villeId ? { villeId } : {}),
      ...(data.quartier ? { quartier: data.quartier } : {}),
      ...(data.profession ? { profession: data.profession } : {}),
      ...(data.nomEmployeur ? { employeur: data.nomEmployeur } : {}),
      ...(data.typePiece ? { typePiece: this.mapTypePiece(data.typePiece) } : {}),
      ...(data.numeroPiece ? { numeroPiece: data.numeroPiece } : {}),
      ...(data.dateDelivrancePiece ? { dateDelivrancePiece: new Date(data.dateDelivrancePiece) } : {}),
      ...(data.lieuDelivrancePiece ? { lieuDelivrancePiece: data.lieuDelivrancePiece } : {}),
      ...(data.pieceRectoUrl ? { pieceRectoUrl: data.pieceRectoUrl } : {}),
      ...(data.pieceVersoUrl ? { pieceVersoUrl: data.pieceVersoUrl } : {}),
      interets: Array.isArray(data.centresInteret) ? data.centresInteret : [],
      ...(data.motivation ? { motivation: data.motivation } : {}),
      accepteReglement: data.accepteReglement ?? false,
      accepteConfidentialite: data.accepteConfidentialite ?? false,
    };

    const motDePasseTemp = this.generatePassword();
    const hash = await bcrypt.hash(motDePasseTemp, 12);
    const numero = await this.generateNumero();

    const result = await this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: { email: emailAdherent, motDePasse: hash, role: 'ADHERENT', actif: false },
      });
      const adherent = await tx.adherent.create({
        data: { ...adherentData, numero, utilisateurId: utilisateur.id },
      });
      await tx.membreOrganisation.create({
        data: { adherentId: adherent.id, organisationId: data.organisationId, statut: 'EN_ATTENTE' },
      });
      return { adherent, utilisateur };
    });

    await this.email.sendInscriptionAdherent(emailAdherent, org.nom);

    const admins = await this.prisma.adminOrganisation.findMany({
      where: { organisationId: data.organisationId },
      select: { utilisateurId: true },
    });
    for (const admin of admins) {
      await this.notifications.create(
        admin.utilisateurId,
        'NOUVELLE_DEMANDE_ADHESION',
        'Nouvelle demande d\'adhésion 👤',
        `${data.prenom} ${data.nom} a soumis une demande d'adhésion à votre organisation.`,
        '/dashboard/mes-adherents',
      );
    }

    return result.adherent;
  }

  async findAll() {
    return this.prisma.adherent.findMany({
      include: {
        utilisateur: { select: { email: true } },
        organisation: { select: { id: true, nom: true, code: true, pays: { select: { id: true, nom: true } } } },
      },
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

    const orgAvecMontant = await this.prisma.organisation.findUnique({ where: { id: adherent.organisationId }, select: { cotisationMontant: true } });
    const montantCotisation = orgAvecMontant?.cotisationMontant ?? parseInt(this.config.get('TARIF_MENSUEL', '20000'), 10);
    const token = uuid();
    await this.prisma.tokenPaiement.create({
      data: {
        token,
        email: adherent.utilisateur.email,
        organisationId: adherent.organisationId,
        adherentId: adherent.id,
        montant: montantCotisation,
        periode: 'MOIS',
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.email.sendAdhesionValidee(
      adherent.utilisateur.email,
      adherent.organisation.nom,
      token,
      montantCotisation,
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

  async update(id: string, data: { nom?: string; prenom?: string }) {
    await this.findOne(id);
    return this.prisma.adherent.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.adherent.update({ where: { id }, data: { statut: 'INACTIF' } });
  }
}
