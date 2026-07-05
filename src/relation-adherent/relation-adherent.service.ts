import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RelationAdherentService {
  constructor(private prisma: PrismaService) {}

  async findAll(adherentId: string) {
    return this.prisma.relationAdherent.findMany({
      where: { adherentId },
      include: {
        adherentLie: { select: { id: true, nom: true, prenom: true } },
      },
    });
  }

  async create(data: { adherentId: string; adherentLieId: string; typeRelation: string }) {
    return this.prisma.relationAdherent.create({ data });
  }

  async remove(id: string) {
    return this.prisma.relationAdherent.delete({ where: { id } });
  }
}
