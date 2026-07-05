import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CaissesService {
  constructor(private prisma: PrismaService) {}

  // ─── Caisses ────────────────────────────────────────────────────────────────

  async createCaisse(data: { organisationId: string; libelle: string; devise?: string }) {
    return this.prisma.caisse.create({ data: { ...data, devise: data.devise ?? 'FCFA' } });
  }

  async findCaisses(organisationId: string) {
    return this.prisma.caisse.findMany({
      where: { organisationId, actif: true },
      include: {
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOneCaisse(id: string) {
    const c = await this.prisma.caisse.findUnique({
      where: { id },
      include: { transactions: { orderBy: { dateTransaction: 'desc' }, take: 100 } },
    });
    if (!c) throw new NotFoundException('Caisse introuvable');
    return c;
  }

  async updateCaisse(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.caisse.update({ where: { id }, data });
  }

  // ─── Transactions ────────────────────────────────────────────────────────────

  async addTransaction(caisseId: string, data: {
    organisationId: string;
    type: 'ENTREE' | 'SORTIE';
    montant: number;
    libelle: string;
    reference?: string;
    dateTransaction?: string;
  }) {
    const caisse = await this.prisma.caisse.findUnique({ where: { id: caisseId } });
    if (!caisse) throw new NotFoundException('Caisse introuvable');

    const montant = Number(data.montant);
    if (montant <= 0) throw new BadRequestException('Montant invalide');

    if (data.type === 'SORTIE' && Number(caisse.solde) < montant) {
      throw new BadRequestException('Solde insuffisant');
    }

    const nouveauSolde = data.type === 'ENTREE'
      ? Number(caisse.solde) + montant
      : Number(caisse.solde) - montant;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          organisationId: data.organisationId,
          caisseId,
          type: data.type,
          montant,
          devise: caisse.devise,
          libelle: data.libelle,
          reference: data.reference,
          dateTransaction: data.dateTransaction ? new Date(data.dateTransaction) : new Date(),
        },
      }),
      this.prisma.caisse.update({
        where: { id: caisseId },
        data: { solde: nouveauSolde },
      }),
    ]);

    return transaction;
  }

  async getTransactions(caisseId: string) {
    return this.prisma.transaction.findMany({
      where: { caisseId },
      orderBy: { dateTransaction: 'desc' },
    });
  }

  // ─── Décaissements ───────────────────────────────────────────────────────────

  async createDecaissement(data: {
    organisationId: string;
    caisseId?: string;
    motif: string;
    montant: number;
    beneficiaire?: string;
    validePar?: string;
    dateDecaissement?: string;
  }) {
    if (data.caisseId) {
      const caisse = await this.prisma.caisse.findUnique({ where: { id: data.caisseId } });
      if (!caisse) throw new NotFoundException('Caisse introuvable');
      if (Number(caisse.solde) < Number(data.montant)) throw new BadRequestException('Solde insuffisant');

      await this.prisma.$transaction([
        this.prisma.decaissement.create({
          data: {
            ...data,
            montant: data.montant,
            dateDecaissement: data.dateDecaissement ? new Date(data.dateDecaissement) : new Date(),
          },
        }),
        this.prisma.caisse.update({
          where: { id: data.caisseId },
          data: { solde: Number(caisse.solde) - Number(data.montant) },
        }),
        this.prisma.transaction.create({
          data: {
            organisationId: data.organisationId,
            caisseId: data.caisseId,
            type: 'SORTIE',
            montant: data.montant,
            devise: caisse.devise,
            libelle: `Décaissement : ${data.motif}`,
            dateTransaction: data.dateDecaissement ? new Date(data.dateDecaissement) : new Date(),
          },
        }),
      ]);
    } else {
      await this.prisma.decaissement.create({
        data: {
          ...data,
          montant: data.montant,
          dateDecaissement: data.dateDecaissement ? new Date(data.dateDecaissement) : new Date(),
        },
      });
    }

    return { success: true };
  }

  async getDecaissements(organisationId: string) {
    return this.prisma.decaissement.findMany({
      where: { organisationId },
      include: { caisse: { select: { libelle: true } } },
      orderBy: { dateDecaissement: 'desc' },
    });
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────

  async stats(organisationId: string) {
    const caisses = await this.prisma.caisse.findMany({ where: { organisationId, actif: true } });
    const totalSolde = caisses.reduce((sum: number, c: any) => sum + Number(c.solde), 0);

    const [totalEntrees, totalSorties, nbDecaissements] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { montant: true },
        where: { organisationId, type: 'ENTREE' },
      }),
      this.prisma.transaction.aggregate({
        _sum: { montant: true },
        where: { organisationId, type: 'SORTIE' },
      }),
      this.prisma.decaissement.count({ where: { organisationId } }),
    ]);

    return {
      totalSolde,
      nbCaisses: caisses.length,
      totalEntrees: totalEntrees._sum.montant ?? 0,
      totalSorties: totalSorties._sum.montant ?? 0,
      nbDecaissements,
    };
  }
}
