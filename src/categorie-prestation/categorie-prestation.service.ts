import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriePrestationService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categoriePrestation.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.categoriePrestation.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.categoriePrestation.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.categoriePrestation.delete({ where: { id } });
  }
}
