import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ISO_ALPHA3_TO_ALPHA2 } from './iso-codes';

@Injectable()
export class PaysService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pays.findMany({
      where: { actif: true },
      include: { villes: true, devise: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const pays = await this.prisma.pays.findUnique({ where: { id }, include: { villes: true, devise: true } });
    if (!pays) throw new NotFoundException('Pays introuvable');
    return pays;
  }

  async create(data: { code: string; nom: string; drapeau?: string; langue?: string; deviseId?: string }) {
    const code = data.code.toUpperCase();
    const drapeau = data.drapeau || ISO_ALPHA3_TO_ALPHA2[code];
    return this.prisma.pays.create({ data: { ...data, code, drapeau } });
  }

  async update(id: string, data: { nom?: string; drapeau?: string; armoirieUrl?: string; langue?: string; deviseId?: string }) {
    return this.prisma.pays.update({ where: { id }, data });
  }

  async toggleActif(id: string, actif: boolean) {
    await this.findOne(id);
    return this.prisma.pays.update({ where: { id }, data: { actif } });
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
      include: { villes: { orderBy: { nom: 'asc' } }, devise: true },
      orderBy: { nom: 'asc' },
    });
  }
}
