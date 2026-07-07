import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaysService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pays.findMany({
      where: { actif: true },
      include: { villes: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const pays = await this.prisma.pays.findUnique({ where: { id }, include: { villes: true } });
    if (!pays) throw new NotFoundException('Pays introuvable');
    return pays;
  }

  async create(data: { code: string; nom: string; drapeau?: string }) {
    return this.prisma.pays.create({ data });
  }

  async update(id: string, data: { nom?: string; drapeau?: string; armoirieUrl?: string; actif?: boolean }) {
    return this.prisma.pays.update({ where: { id }, data });
  }

  async setArmoirie(id: string, armoirieUrl: string) {
    await this.findOne(id);
    return this.prisma.pays.update({ where: { id }, data: { armoirieUrl } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.pays.update({ where: { id }, data: { actif: false } });
  }

  async addVille(paysId: string, nom: string) {
    await this.findOne(paysId);
    return this.prisma.ville.create({ data: { nom, paysId } });
  }

  async deleteVille(villeId: string) {
    return this.prisma.ville.delete({ where: { id: villeId } });
  }

  async findAllIncludingInactive() {
    return this.prisma.pays.findMany({
      include: { villes: { orderBy: { nom: 'asc' } } },
      orderBy: { nom: 'asc' },
    });
  }
}
