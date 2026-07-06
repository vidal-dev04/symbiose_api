import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { IaService } from '../ia/ia.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class OrganisationsService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private ia: IaService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {}

  private async generateCode(): Promise<string> {
    const count = await this.prisma.organisation.count();
    return `ORG${String(count + 1).padStart(3, '0')}`;
  }

  private generatePassword(length = 10): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  async create(data: any) {
    const emailAdmin = data.responsableEmail || data.email;

    const existing = await this.prisma.utilisateur.findUnique({ where: { email: emailAdmin } });
    if (existing) throw new ConflictException('Un compte avec cet email existe déjà');

    const motDePasse = this.generatePassword();
    const hash = await bcrypt.hash(motDePasse, 12);
    const code = await this.generateCode();

    const { responsableEmail: _, ...orgData } = data;

    const org = await this.prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: { email: emailAdmin, motDePasse: hash, role: 'ADMIN_ORG', actif: true },
      });
      const organisation = await tx.organisation.create({
        data: { ...orgData, code, responsableEmail: emailAdmin },
      });
      await tx.adminOrganisation.create({
        data: { utilisateurId: utilisateur.id, organisationId: organisation.id },
      });
      return { organisation, utilisateur };
    });

    await this.email.sendInscriptionOrganisation(emailAdmin, org.organisation.nom);

    this.ia.analyserDossierOrganisation({
      nom: org.organisation.nom,
      type: org.organisation.type,
      description: org.organisation.description ?? undefined,
      secteurs: org.organisation.secteurs,
      email: org.organisation.email,
      telephone: org.organisation.telephone,
      responsableNom: org.organisation.responsableNom,
      responsablePrenom: org.organisation.responsablePrenom,
      responsableFonction: org.organisation.responsableFonction,
    }).then(async (analyse) => {
      if (analyse) {
        await this.prisma.organisation.update({
          where: { id: org.organisation.id },
          data: { rapportIA: analyse.rapport, scoreIA: analyse.score },
        });
      }
    }).catch(() => {});

    return org.organisation;
  }

  async findAll(filters?: { type?: string; statut?: string; paysId?: string }) {
    const where: any = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.statut) where.statut = filters.statut;
    if (filters?.paysId) where.paysId = filters.paysId;

    return this.prisma.organisation.findMany({
      where,
      include: { pays: true, ville: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { id },
      include: {
        pays: true,
        ville: true,
        adherents: { select: { id: true, nom: true, prenom: true, statut: true } },
        abonnement: true,
        admins: { include: { utilisateur: { select: { id: true, email: true } } } },
      },
    });
    if (!org) throw new NotFoundException('Organisation introuvable');
    return org;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.organisation.update({ where: { id }, data });
  }

  async updateStatut(id: string, statut: string) {
    await this.findOne(id);
    return this.prisma.organisation.update({
      where: { id },
      data: { statut: statut as any },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.organisation.delete({ where: { id } });
  }

  async validerOrganisation(id: string) {
    const org = await this.findOne(id);
    if (org.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cette organisation a déjà été traitée');
    }

    const tarifMensuel = parseInt(this.config.get('TARIF_MENSUEL', '16500'), 10);
    const token = uuid();
    const motDePasse = this.generatePassword();
    const hash = await bcrypt.hash(motDePasse, 12);

    await this.prisma.$transaction([
      this.prisma.organisation.update({ where: { id }, data: { statut: 'ACTIVE' } }),
      this.prisma.utilisateur.update({
        where: { email: org.responsableEmail! },
        data: { motDePasse: hash },
      }),
      this.prisma.tokenPaiement.create({
        data: {
          token,
          email: org.responsableEmail!,
          organisationId: id,
          montant: tarifMensuel,
          periode: 'MOIS',
          expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    await this.email.sendOrganisationValidee(org.responsableEmail!, org.nom, motDePasse, token, tarifMensuel);

    const responsable = await this.prisma.utilisateur.findUnique({ where: { email: org.responsableEmail! } });
    if (responsable) {
      await this.notifications.create(
        responsable.id,
        'ORG_VALIDEE',
        'Organisation validée ✅',
        `Votre organisation "${org.nom}" a été validée. Consultez votre email pour activer votre compte.`,
        '/dashboard',
      );
    }

    return { success: true };
  }

  async refuserOrganisation(id: string, motif: string) {
    const org = await this.findOne(id);
    if (org.statut !== 'EN_ATTENTE') {
      throw new BadRequestException('Cette organisation a déjà été traitée');
    }

    await this.prisma.organisation.update({ where: { id }, data: { statut: 'INACTIVE' } });
    await this.email.sendOrganisationRefusee(org.responsableEmail!, org.nom, motif);

    const responsable = await this.prisma.utilisateur.findUnique({ where: { email: org.responsableEmail! } });
    if (responsable) {
      await this.notifications.create(
        responsable.id,
        'ORG_REFUSEE',
        'Organisation refusée ❌',
        `Votre demande pour "${org.nom}" a été refusée. Motif : ${motif}`,
      );
    }

    return { success: true };
  }

  async renvoyerMailOrganisation(id: string) {
    const org = await this.findOne(id);
    if (!org.responsableEmail) throw new BadRequestException('Email responsable manquant');

    if (org.statut === 'ACTIVE') {
      const tokenPaiement = await this.prisma.tokenPaiement.findFirst({
        where: { organisationId: id },
        orderBy: { createdAt: 'desc' },
      });
      const tarifMensuel = parseInt(this.config.get('TARIF_MENSUEL', '16500'), 10);
      const token = tokenPaiement?.token ?? uuid();
      const nouveauMotDePasse = this.generatePassword();
      const hash = await bcrypt.hash(nouveauMotDePasse, 12);
      await this.prisma.utilisateur.update({
        where: { email: org.responsableEmail! },
        data: { motDePasse: hash },
      });
      await this.email.sendOrganisationValidee(org.responsableEmail, org.nom, nouveauMotDePasse, token, tarifMensuel);
    } else if (org.statut === 'EN_ATTENTE') {
      await this.email.sendInscriptionOrganisation(org.responsableEmail, org.nom);
    } else {
      throw new BadRequestException('Impossible de renvoyer un mail pour cette organisation');
    }
    return { success: true, message: 'Email renvoyé avec succès' };
  }

  async stats() {
    const [total, parType, parStatut, parPays, totalAdherents, recentOrgs] = await Promise.all([
      this.prisma.organisation.count(),
      this.prisma.organisation.groupBy({ by: ['type'], _count: true }),
      this.prisma.organisation.groupBy({ by: ['statut'], _count: true }),
      this.prisma.organisation.groupBy({ by: ['paysId'], _count: true }),
      this.prisma.adherent.count(),
      this.prisma.organisation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { pays: true },
      }),
    ]);
    return { total, parType, parStatut, parPays, totalAdherents, recentOrgs };
  }

  async analyseIaAll() {
    const orgs = await this.prisma.organisation.findMany({
      select: {
        id: true, nom: true, type: true, statut: true, code: true,
        scoreIA: true, rapportIA: true, logoUrl: true,
        pays: { select: { nom: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orgs;
  }

  async analyserOrganisationIA(id: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { id },
      include: { pays: true, ville: true },
    });
    if (!org) throw new NotFoundException('Organisation introuvable');

    const result = await this.ia.analyserDossierOrganisation({
      nom: org.nom,
      type: org.type,
      description: org.description ?? undefined,
      secteurs: org.secteurs ?? [],
      email: org.email,
      telephone: org.telephone,
      responsableNom: org.responsableNom,
      responsablePrenom: org.responsablePrenom,
      responsableFonction: org.responsableFonction,
      pays: org.pays?.nom ?? undefined,
      ville: org.ville?.nom ?? undefined,
    });

    if (!result) {
      return { message: 'Analyse IA non disponible (clé GROQ_API_KEY manquante)', scoreIA: null, rapportIA: null };
    }

    const updated = await this.prisma.organisation.update({
      where: { id },
      data: { scoreIA: result.score, rapportIA: result.rapport },
      select: { id: true, nom: true, scoreIA: true, rapportIA: true },
    });
    return updated;
  }
}
