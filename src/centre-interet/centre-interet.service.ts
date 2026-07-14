import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CentreInteretService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.centreInteret.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: { code: string; libelle: string }) {
    return this.prisma.centreInteret.create({ data });
  }

  async update(id: string, data: { libelle?: string; actif?: boolean }) {
    return this.prisma.centreInteret.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.centreInteret.delete({ where: { id } });
  }
}
