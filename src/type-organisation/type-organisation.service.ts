import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TypeOrganisationService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.typeOrganisation.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.typeOrganisation.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.typeOrganisation.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.typeOrganisation.delete({ where: { id } });
  }
}
