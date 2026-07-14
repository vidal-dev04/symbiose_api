import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TypeMutuelleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.typeMutuelle.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.typeMutuelle.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.typeMutuelle.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.typeMutuelle.delete({ where: { id } });
  }
}
