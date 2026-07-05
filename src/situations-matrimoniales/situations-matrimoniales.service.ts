import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SituationsMatrimonialesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.situationMatrimoniale.findMany({ orderBy: { libelle: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.situationMatrimoniale.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.situationMatrimoniale.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.situationMatrimoniale.delete({ where: { id } });
  }
}
