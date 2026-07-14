import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategorieAdherentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categorieAdherent.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.categorieAdherent.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.categorieAdherent.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.categorieAdherent.delete({ where: { id } });
  }
}
