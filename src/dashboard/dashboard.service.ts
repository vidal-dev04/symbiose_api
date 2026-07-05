import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async statsSuperAdmin() {
    const now = new Date();
    const debut12Mois = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [totalOrgs, totalAdherents, parType, parStatut, recentOrgs, orgsParMois, adherentsParMois] =
      await Promise.all([
        this.prisma.organisation.count(),
        this.prisma.adherent.count(),
        this.prisma.organisation.groupBy({ by: ['type'], _count: true }),
        this.prisma.organisation.groupBy({ by: ['statut'], _count: true }),
        this.prisma.organisation.findMany({
          take: 6, orderBy: { createdAt: 'desc' }, include: { pays: { select: { nom: true } } },
        }),
        this.prisma.organisation.findMany({
          where: { createdAt: { gte: debut12Mois } },
          select: { createdAt: true },
        }),
        this.prisma.adherent.findMany({
          where: { createdAt: { gte: debut12Mois } },
          select: { createdAt: true },
        }),
      ]);

    return {
      role: 'SUPER_ADMIN',
      kpis: [
        { label: 'Organisations', value: totalOrgs, icon: 'corporate_fare', color: '#1A1A1A' },
        { label: 'Adhérents', value: totalAdherents, icon: 'people', color: '#F05A22' },
        { label: 'ONG', value: parType.find(p => p.type === 'ONG')?._count ?? 0, icon: 'volunteer_activism', color: '#F05A22' },
        { label: 'Mutuelles', value: parType.find(p => p.type === 'MUTUELLE')?._count ?? 0, icon: 'handshake', color: '#1A1A1A' },
      ],
      parType: parType.map(p => ({ label: p.type, value: p._count })),
      parStatut: parStatut.map(s => ({ label: s.statut, value: s._count })),
      recentOrgs,
      courbe: {
        label: 'Nouvelles organisations',
        data: this.aggroParMois(orgsParMois.map(o => o.createdAt), debut12Mois),
      },
      courbeAdherents: {
        label: 'Nouveaux adhérents',
        data: this.aggroParMois(adherentsParMois.map(a => a.createdAt), debut12Mois),
      },
    };
  }

  async statsAdminOrg(organisationId: string) {
    const now = new Date();
    const debut12Mois = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

    const [org, totalAdherents, enAttente, cotisationsMois, totalCotisations, dons,
      prochainEvenements, adherentsParMois, cotisationsParMois, soldesCaisses] =
      await Promise.all([
        this.prisma.organisation.findUnique({
          where: { id: organisationId },
          select: { nom: true, logoUrl: true, type: true, statut: true },
        }),
        this.prisma.adherent.count({ where: { organisationId } }),
        this.prisma.adherent.count({ where: { organisationId, statut: 'EN_ATTENTE' } }),
        this.prisma.cotisation.aggregate({
          where: { organisationId, createdAt: { gte: debutMois } },
          _sum: { montant: true }, _count: true,
        }),
        this.prisma.cotisation.aggregate({
          where: { organisationId }, _sum: { montant: true },
        }),
        this.prisma.don.aggregate({
          where: { organisationId }, _sum: { montant: true }, _count: true,
        }),
        this.prisma.evenement.findMany({
          where: { organisationId, dateDebut: { gte: now } },
          orderBy: { dateDebut: 'asc' }, take: 5,
          select: { id: true, titre: true, dateDebut: true, lieu: true },
        }),
        this.prisma.adherent.findMany({
          where: { organisationId, createdAt: { gte: debut12Mois } },
          select: { createdAt: true },
        }),
        this.prisma.cotisation.findMany({
          where: { organisationId, createdAt: { gte: debut12Mois } },
          select: { createdAt: true, montant: true },
        }),
        this.prisma.caisse.findMany({
          where: { organisationId, actif: true },
          select: { libelle: true, solde: true, devise: true },
        }),
      ]);

    const soldeTotalXOF = soldesCaisses.reduce((sum, c) => sum + Number(c.solde ?? 0), 0);

    return {
      role: 'ADMIN_ORG',
      organisation: org,
      kpis: [
        { label: 'Adhérents', value: totalAdherents, icon: 'people', color: '#F05A22' },
        { label: 'En attente', value: enAttente, icon: 'pending_actions', color: '#F5A623' },
        { label: 'Cotisations ce mois', value: cotisationsMois._sum.montant ?? 0, icon: 'payments', color: '#2e7d32', isMoney: true },
        { label: 'Solde caisses', value: soldeTotalXOF, icon: 'account_balance_wallet', color: '#1A1A1A', isMoney: true },
      ],
      totalCotisations: totalCotisations._sum.montant ?? 0,
      totalDons: dons._sum.montant ?? 0,
      nombreDons: dons._count,
      prochainEvenements,
      soldesCaisses,
      courbeAdherents: {
        label: 'Nouveaux adhérents',
        data: this.aggroParMois(adherentsParMois.map(a => a.createdAt), debut12Mois),
      },
      courbeCotisations: {
        label: 'Cotisations (XOF)',
        data: this.aggroMontantsParMois(cotisationsParMois.map(r => ({ createdAt: r.createdAt, montant: Number(r.montant) })), debut12Mois),
      },
    };
  }

  async statsAdminOrgByUserId(userId: string) {
    const adminOrg = await this.prisma.adminOrganisation.findFirst({
      where: { utilisateurId: userId },
      select: { organisationId: true },
    });
    if (!adminOrg) return { role: 'ADMIN_ORG', kpis: [], error: 'Organisation introuvable' };
    return this.statsAdminOrg(adminOrg.organisationId);
  }

  async statsAdherentByUserId(userId: string) {
    const adherent = await this.prisma.adherent.findFirst({
      where: { utilisateurId: userId },
      select: { id: true },
    });
    if (!adherent) return { role: 'ADHERENT', kpis: [], error: 'Adhérent introuvable' };
    return this.statsAdherent(adherent.id);
  }

  async statsAdherent(adherentId: string) {
    const now = new Date();
    const debut6Mois = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [adherent, cotisations, evenements, memberships] = await Promise.all([
      this.prisma.adherent.findUnique({
        where: { id: adherentId },
        select: { nom: true, prenom: true, statut: true, organisation: { select: { nom: true, logoUrl: true } } },
      }),
      this.prisma.cotisation.findMany({
        where: { adherentId },
        orderBy: { createdAt: 'desc' }, take: 6,
        select: { montant: true, statut: true, createdAt: true, periode: true },
      }),
      this.prisma.evenement.findMany({
        where: { organisationId: (await this.prisma.adherent.findUnique({ where: { id: adherentId }, select: { organisationId: true } }))?.organisationId ?? '', dateDebut: { gte: now } },
        orderBy: { dateDebut: 'asc' }, take: 5,
        select: { id: true, titre: true, dateDebut: true, lieu: true },
      }),
      this.prisma.membreOrganisation.findMany({
        where: { adherentId },
        include: { organisation: { select: { nom: true, logoUrl: true, code: true } } },
      }),
    ]);

    const cotisationsParMois = await this.prisma.cotisation.findMany({
      where: { adherentId, createdAt: { gte: debut6Mois } },
      select: { createdAt: true, montant: true },
    });

    const totalPaye = cotisations.filter((c: any) => c.statut === 'PAYE').reduce((s: number, c: any) => s + Number(c.montant ?? 0), 0);
    const enRetard = cotisations.filter((c: any) => c.statut === 'EN_RETARD').length;

    return {
      role: 'ADHERENT',
      adherent,
      memberships,
      kpis: [
        { label: 'Cotisations payées', value: totalPaye, icon: 'payments', color: '#2e7d32', isMoney: true },
        { label: 'En retard', value: enRetard, icon: 'warning', color: '#c62828' },
        { label: 'Organisations', value: memberships.length, icon: 'corporate_fare', color: '#1A1A1A' },
        { label: 'Événements à venir', value: evenements.length, icon: 'event', color: '#F05A22' },
      ],
      cotisations,
      prochainEvenements: evenements,
      courbeCotisations: {
        label: 'Mes cotisations (6 mois)',
        data: this.aggroMontantsParMois(cotisationsParMois.map(r => ({ createdAt: r.createdAt, montant: Number(r.montant) })), debut6Mois),
      },
    };
  }

  private aggroParMois(dates: Date[], debut: Date): { mois: string; value: number }[] {
    const result: { mois: string; value: number }[] = [];
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const nbMois = dates.length > 0 ? 12 : 6;
    for (let i = 0; i < nbMois; i++) {
      const d = new Date(debut.getFullYear(), debut.getMonth() + i, 1);
      const count = dates.filter(dt => new Date(dt).getFullYear() === d.getFullYear() && new Date(dt).getMonth() === d.getMonth()).length;
      result.push({ mois: moisNoms[d.getMonth()], value: count });
    }
    return result;
  }

  private aggroMontantsParMois(rows: { createdAt: Date; montant: number }[], debut: Date): { mois: string; value: number }[] {
    const result: { mois: string; value: number }[] = [];
    const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    for (let i = 0; i < 6; i++) {
      const d = new Date(debut.getFullYear(), debut.getMonth() + i, 1);
      const total = rows
        .filter(r => new Date(r.createdAt).getFullYear() === d.getFullYear() && new Date(r.createdAt).getMonth() === d.getMonth())
        .reduce((s, r) => s + (r.montant ?? 0), 0);
      result.push({ mois: moisNoms[d.getMonth()], value: total });
    }
    return result;
  }
}
