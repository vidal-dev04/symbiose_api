import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecteurActiviteService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.secteurActivite.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.secteurActivite.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.secteurActivite.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.secteurActivite.delete({ where: { id } });
  }
}
