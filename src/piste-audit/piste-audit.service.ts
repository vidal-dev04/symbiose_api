import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PisteAuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    utilisateurId?: string;
    action: string;
    table: string;
    enregistrementId?: string;
    ancienneValeur?: object;
    nouvelleValeur?: object;
    ip?: string;
  }) {
    return this.prisma.pisteAudit.create({ data });
  }

  async findAll(utilisateurId?: string, limit = 50) {
    return this.prisma.pisteAudit.findMany({
      where: utilisateurId ? { utilisateurId } : {},
      include: {
        utilisateur: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByUtilisateur(utilisateurId: string, limit = 30) {
    return this.prisma.pisteAudit.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
