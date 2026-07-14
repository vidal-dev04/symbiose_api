import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TypeAssociationService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.typeAssociation.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.typeAssociation.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.typeAssociation.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.typeAssociation.delete({ where: { id } });
  }
}
