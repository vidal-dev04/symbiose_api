import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComptesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.utilisateur.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        id: true, email: true, actif: true, derniereConnexion: true, createdAt: true, groupeId: true,
        groupe: { select: { id: true, code: true, libelle: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: { email: string; motDePasse: string; groupeId?: string }) {
    const existing = await this.prisma.utilisateur.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Un compte avec cet email existe déjà');

    const hash = await bcrypt.hash(data.motDePasse, 12);
    return this.prisma.utilisateur.create({
      data: {
        email: data.email,
        motDePasse: hash,
        role: 'SUPER_ADMIN',
        emailVerifie: true,
        groupeId: data.groupeId || undefined,
      },
      select: { id: true, email: true, actif: true, groupeId: true, createdAt: true },
    });
  }

  async updateGroupe(id: string, groupeId: string | null) {
    await this.findOneOrThrow(id);
    return this.prisma.utilisateur.update({
      where: { id },
      data: { groupeId },
      select: { id: true, email: true, groupeId: true },
    });
  }

  async toggleActif(id: string, requesterId: string) {
    if (id === requesterId) throw new BadRequestException('Vous ne pouvez pas désactiver votre propre compte');
    const user = await this.findOneOrThrow(id);
    return this.prisma.utilisateur.update({ where: { id }, data: { actif: !user.actif } });
  }

  private async findOneOrThrow(id: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!user || user.role !== 'SUPER_ADMIN') throw new NotFoundException('Compte introuvable');
    return user;
  }
}
