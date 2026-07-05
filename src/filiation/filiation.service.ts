import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FiliationService {
  constructor(private prisma: PrismaService) {}

  async lier(parentId: string, enfantId: string) {
    if (parentId === enfantId) throw new ConflictException('Une organisation ne peut pas être sa propre parente');
    const existing = await this.prisma.filiation.findFirst({ where: { parentId, enfantId } });
    if (existing) throw new ConflictException('Lien déjà existant');
    return this.prisma.filiation.create({
      data: { parentId, enfantId },
      include: {
        parent: { select: { nom: true } },
        enfant: { select: { nom: true } },
      },
    });
  }

  async findEnfants(parentId: string) {
    return this.prisma.filiation.findMany({
      where: { parentId },
      include: { enfant: { select: { id: true, nom: true, ville: true } } },
    });
  }

  async findParents(enfantId: string) {
    return this.prisma.filiation.findMany({
      where: { enfantId },
      include: { parent: { select: { id: true, nom: true, ville: true } } },
    });
  }

  async supprimer(parentId: string, enfantId: string) {
    await this.prisma.filiation.deleteMany({ where: { parentId, enfantId } });
    return { success: true };
  }
}
