import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CotisationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(data: { adherentId: string; organisationId: string; montant: number; periode: string; dateEcheance: string }) {
    const adherent = await this.prisma.adherent.findUnique({
      where: { id: data.adherentId },
      include: { organisation: true },
    });
    if (!adherent) throw new NotFoundException('Adhérent introuvable');

    const ref = `COT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const cotisation = await this.prisma.cotisation.create({
      data: {
        adherentId: data.adherentId,
        organisationId: data.organisationId,
        montant: data.montant,
        periode: data.periode,
        dateEcheance: new Date(data.dateEcheance),
        reference: ref,
      },
      include: { adherent: { include: { utilisateur: { select: { email: true } } } } },
    });

    await this.notifications.create(
      adherent.utilisateurId,
      'COTISATION_CREEE',
      'Nouvelle cotisation 💳',
      `Une cotisation de ${data.montant} FCFA a été créée pour la période ${data.periode}. Échéance : ${new Date(data.dateEcheance).toLocaleDateString('fr-FR')}.`,
      '/dashboard/ma-cotisation',
    );

    return cotisation;
  }

  async createBatch(organisationId: string, montant: number, periode: string, dateEcheance: string) {
    const adherents = await this.prisma.adherent.findMany({
      where: { organisationId, statut: 'ACTIF' },
    });

    const results = await Promise.allSettled(
      adherents.map(a =>
        this.create({ adherentId: a.id, organisationId, montant, periode, dateEcheance }),
      ),
    );

    const ok = results.filter(r => r.status === 'fulfilled').length;
    return { total: adherents.length, creees: ok };
  }

  async findByOrganisation(organisationId: string, statut?: string) {
    return this.prisma.cotisation.findMany({
      where: { organisationId, ...(statut ? { statut } : {}) },
      include: {
        adherent: {
          select: { nom: true, prenom: true, utilisateur: { select: { email: true } } },
        },
      },
      orderBy: { dateEcheance: 'desc' },
    });
  }

  async findByAdherent(adherentId: string) {
    return this.prisma.cotisation.findMany({
      where: { adherentId },
      orderBy: { dateEcheance: 'desc' },
    });
  }

  async findGlobal(filters?: { statut?: string; organisationId?: string; periode?: string; paysId?: string }) {
    const where: any = {};
    if (filters?.statut) where.statut = filters.statut;
    if (filters?.organisationId) where.organisationId = filters.organisationId;
    if (filters?.periode) where.periode = { contains: filters.periode, mode: 'insensitive' };
    if (filters?.paysId) where.organisation = { paysId: filters.paysId };
    return this.prisma.cotisation.findMany({
      where,
      include: {
        adherent: { select: { nom: true, prenom: true } },
        organisation: { select: { nom: true, code: true, type: true, pays: { select: { id: true, nom: true, code: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async statsGlobal() {
    const [total, payees, enAttente, retard, montantAgg] = await Promise.all([
      this.prisma.cotisation.count(),
      this.prisma.cotisation.count({ where: { statut: 'PAYEE' } }),
      this.prisma.cotisation.count({ where: { statut: 'EN_ATTENTE' } }),
      this.prisma.cotisation.count({ where: { statut: 'EN_ATTENTE', dateEcheance: { lt: new Date() } } }),
      this.prisma.cotisation.aggregate({ _sum: { montant: true }, where: { statut: 'PAYEE' } }),
    ]);
    return {
      total,
      payees,
      enAttente,
      retard,
      montantCollecte: Number(montantAgg._sum.montant ?? 0),
      tauxPaiement: total > 0 ? Math.round((payees / total) * 100) : 0,
    };
  }

  async stats(organisationId: string) {
    const [total, payees, enAttente, retard] = await Promise.all([
      this.prisma.cotisation.count({ where: { organisationId } }),
      this.prisma.cotisation.count({ where: { organisationId, statut: 'PAYEE' } }),
      this.prisma.cotisation.count({ where: { organisationId, statut: 'EN_ATTENTE' } }),
      this.prisma.cotisation.count({
        where: { organisationId, statut: 'EN_ATTENTE', dateEcheance: { lt: new Date() } },
      }),
    ]);
    const montantTotalPayees = await this.prisma.cotisation.aggregate({
      _sum: { montant: true },
      where: { organisationId, statut: 'PAYEE' },
    });
    return {
      total,
      payees,
      enAttente,
      retard,
      montantCollecte: montantTotalPayees._sum.montant ?? 0,
    };
  }

  async payer(id: string) {
    const cot = await this.prisma.cotisation.findUnique({
      where: { id },
      include: { adherent: true },
    });
    if (!cot) throw new NotFoundException('Cotisation introuvable');
    if (cot.statut === 'PAYEE') throw new BadRequestException('Déjà payée');

    const updated = await this.prisma.cotisation.update({
      where: { id },
      data: { statut: 'PAYEE', datePaiement: new Date() },
    });

    await this.notifications.create(
      cot.adherent.utilisateurId,
      'COTISATION_PAYEE',
      'Cotisation confirmée ✅',
      `Votre cotisation de ${Number(cot.montant)} FCFA a bien été enregistrée.`,
      '/dashboard/ma-cotisation',
    );

    return updated;
  }

  async annuler(id: string) {
    const cot = await this.prisma.cotisation.findUnique({ where: { id } });
    if (!cot) throw new NotFoundException('Cotisation introuvable');
    return this.prisma.cotisation.update({ where: { id }, data: { statut: 'ANNULEE' } });
  }
}
