import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PaiementsService {
  private readonly tarifMensuel: number;

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private config: ConfigService,
  ) {
    this.tarifMensuel = parseInt(this.config.get('TARIF_MENSUEL', '16500'), 10);
  }

  private generatePassword(length = 10): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  calculerMontant(periode: string): number {
    switch (periode) {
      case 'MOIS': return this.tarifMensuel;
      case 'TRIMESTRE': return this.tarifMensuel * 3;
      case 'SEMESTRE': return this.tarifMensuel * 6;
      case 'ANNEE': return this.tarifMensuel * 12;
      default: return this.tarifMensuel;
    }
  }

  calculerDateFin(debut: Date, periode: string): Date {
    const fin = new Date(debut);
    switch (periode) {
      case 'MOIS': fin.setMonth(fin.getMonth() + 1); break;
      case 'TRIMESTRE': fin.setMonth(fin.getMonth() + 3); break;
      case 'SEMESTRE': fin.setMonth(fin.getMonth() + 6); break;
      case 'ANNEE': fin.setFullYear(fin.getFullYear() + 1); break;
    }
    return fin;
  }

  async initierPaiement(data: {
    organisationId: string;
    periode: string;
    mode: string;
    operateur?: string;
    numeroMobile?: string;
    derniers4?: string;
    banqueCheque?: string;
    numeroCheque?: string;
    banqueVirement?: string;
    referenceVirement?: string;
  }) {
    const org = await this.prisma.organisation.findUnique({ where: { id: data.organisationId } });
    if (!org) throw new NotFoundException('Organisation introuvable');

    const montant = this.calculerMontant(data.periode);
    const reference = `PAY-${Date.now()}-${uuid().slice(0, 8).toUpperCase()}`;

    const paiement = await this.prisma.paiement.create({
      data: {
        organisationId: data.organisationId,
        montant,
        periode: data.periode as any,
        mode: data.mode as any,
        reference,
        operateur: data.operateur,
        numeroMobile: data.numeroMobile,
        derniers4: data.derniers4,
        banqueCheque: data.banqueCheque,
        numeroCheque: data.numeroCheque,
        banqueVirement: data.banqueVirement,
        referenceVirement: data.referenceVirement,
      },
    });

    return paiement;
  }

  async confirmerPaiement(id: string) {
    const paiement = await this.prisma.paiement.findUnique({
      where: { id },
      include: { organisation: true },
    });
    if (!paiement) throw new NotFoundException('Paiement introuvable');
    if (paiement.statut !== 'EN_ATTENTE') throw new BadRequestException('Paiement déjà traité');

    const now = new Date();
    const dateFin = this.calculerDateFin(now, paiement.periode);

    await this.prisma.$transaction([
      this.prisma.paiement.update({
        where: { id },
        data: { statut: 'CONFIRME' },
      }),
      this.prisma.abonnement.upsert({
        where: { organisationId: paiement.organisationId },
        create: {
          organisationId: paiement.organisationId,
          statut: 'ACTIF',
          periode: paiement.periode,
          montant: paiement.montant,
          dateDebut: now,
          dateFin,
        },
        update: {
          statut: 'ACTIF',
          periode: paiement.periode,
          montant: paiement.montant,
          dateDebut: now,
          dateFin,
        },
      }),
      this.prisma.organisation.update({
        where: { id: paiement.organisationId },
        data: { statut: 'ACTIVE' },
      }),
    ]);

    const periodeLabel = { MOIS: 'Mois', TRIMESTRE: 'Trimestre', SEMESTRE: 'Semestre', ANNEE: 'Année' };
    await this.email.sendPaiementConfirme(
      paiement.organisation.email,
      paiement.montant,
      periodeLabel[paiement.periode] || paiement.periode,
      dateFin.toLocaleDateString('fr-FR'),
    );

    return { success: true, dateFin };
  }

  async payerPlusTard(organisationId: string, email: string, periode: string) {
    const essaiJours = this.config.get('ESSAI_JOURS', 3);
    const montant = this.calculerMontant(periode);
    const expiration = new Date(Date.now() + essaiJours * 24 * 60 * 60 * 1000);

    await this.prisma.abonnement.upsert({
      where: { organisationId },
      create: {
        organisationId,
        statut: 'ESSAI',
        periode: periode as any,
        montant,
        dateDebut: new Date(),
        dateFin: expiration,
        essaiExpiration: expiration,
      },
      update: {
        statut: 'ESSAI',
        essaiExpiration: expiration,
      },
    });

    const token = uuid();
    await this.prisma.tokenPaiement.create({
      data: {
        token,
        email,
        organisationId,
        montant,
        periode: periode as any,
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.email.sendCompteCreeSansPaiement(email, token, essaiJours);

    return { essaiExpiration: expiration };
  }

  async payerViaToken(tokenStr: string, mode: string, infos: any) {
    const tokenPaiement = await this.prisma.tokenPaiement.findUnique({ where: { token: tokenStr } });
    if (!tokenPaiement) throw new NotFoundException('Lien de paiement invalide');
    if (tokenPaiement.utilise) throw new BadRequestException('Ce lien a déjà été utilisé');
    if (new Date() > tokenPaiement.expireAt) throw new BadRequestException('Ce lien a expiré');

    await this.prisma.tokenPaiement.update({ where: { id: tokenPaiement.id }, data: { utilise: true } });

    if (tokenPaiement.adherentId) {
      const adherent = await this.prisma.adherent.findUnique({
        where: { id: tokenPaiement.adherentId },
        include: {
          utilisateur: { select: { id: true, email: true } },
          organisation: { select: { nom: true } },
        },
      });
      if (!adherent) throw new NotFoundException('Adhérent introuvable');

      const nouveauMotDePasse = this.generatePassword();
      const hash = await bcrypt.hash(nouveauMotDePasse, 12);

      await this.prisma.$transaction([
        this.prisma.adherent.update({
          where: { id: adherent.id },
          data: { statut: 'ACTIF' as any },
        }),
        this.prisma.utilisateur.update({
          where: { id: adherent.utilisateur.id },
          data: { motDePasse: hash, actif: true },
        }),
      ]);

      await this.email.sendAccesAdherent(
        adherent.utilisateur.email,
        adherent.organisation.nom,
        nouveauMotDePasse,
      );

      return { success: true, type: 'adherent' };
    }

    const paiement = await this.initierPaiement({
      organisationId: tokenPaiement.organisationId!,
      periode: tokenPaiement.periode,
      mode,
      ...infos,
    });

    return this.confirmerPaiement(paiement.id);
  }

  async getTokenInfo(token: string) {
    const t = await this.prisma.tokenPaiement.findUnique({ where: { token } });
    if (!t) throw new NotFoundException('Token introuvable');
    return t;
  }

  async getActiveTokenForOrg(organisationId: string) {
    const t = await this.prisma.tokenPaiement.findFirst({
      where: { organisationId, utilise: false, expireAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!t) throw new NotFoundException('Aucun token actif');
    return t;
  }

  async findByOrganisation(organisationId: string) {
    return this.prisma.paiement.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
