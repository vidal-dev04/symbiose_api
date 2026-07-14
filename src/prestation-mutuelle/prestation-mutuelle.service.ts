import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrestationMutuelleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.prestationMutuelle.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.prestationMutuelle.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.prestationMutuelle.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.prestationMutuelle.delete({ where: { id } });
  }
}
