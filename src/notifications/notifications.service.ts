import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(utilisateurId: string, type: string, titre: string, message: string, lien?: string) {
    return this.prisma.notification.create({
      data: { utilisateurId, type, titre, message, lien },
    });
  }

  async findAll(utilisateurId: string) {
    return this.prisma.notification.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async countNonLues(utilisateurId: string) {
    const count = await this.prisma.notification.count({
      where: { utilisateurId, lu: false },
    });
    return { count };
  }

  async marquerLue(id: string, utilisateurId: string) {
    return this.prisma.notification.updateMany({
      where: { id, utilisateurId },
      data: { lu: true },
    });
  }

  async toutMarquerLu(utilisateurId: string) {
    return this.prisma.notification.updateMany({
      where: { utilisateurId, lu: false },
      data: { lu: true },
    });
  }
}
