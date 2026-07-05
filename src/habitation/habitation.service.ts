import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HabitationService {
  constructor(private prisma: PrismaService) {}

  async findByAdherent(adherentId: string) {
    return this.prisma.habitation.findUnique({ where: { adherentId } });
  }

  async upsert(adherentId: string, data: {
    adresse?: string;
    quartier?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
    typeLogement?: string;
  }) {
    return this.prisma.habitation.upsert({
      where: { adherentId },
      create: { adherentId, ...data },
      update: data,
    });
  }

  async remove(adherentId: string) {
    return this.prisma.habitation.delete({ where: { adherentId } });
  }
}
