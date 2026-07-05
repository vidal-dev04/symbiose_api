import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjetsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    organisationId: string;
    titre: string;
    description?: string;
    statut?: string;
    budget?: number;
    dateDebut?: string;
    dateFin?: string;
    responsable?: string;
  }) {
    return this.prisma.projet.create({
      data: {
        ...data,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : null,
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
      },
    });
  }

  async findAll(organisationId: string, statut?: string) {
    return this.prisma.projet.findMany({
      where: { organisationId, ...(statut ? { statut } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.projet.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Projet introuvable');
    return p;
  }

  async update(id: string, data: any) {
    return this.prisma.projet.update({
      where: { id },
      data: {
        ...data,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
        dateFin: data.dateFin ? new Date(data.dateFin) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.projet.delete({ where: { id } });
  }

  async stats(organisationId: string) {
    const [total, enCours, termines, enPause] = await Promise.all([
      this.prisma.projet.count({ where: { organisationId } }),
      this.prisma.projet.count({ where: { organisationId, statut: 'EN_COURS' } }),
      this.prisma.projet.count({ where: { organisationId, statut: 'TERMINE' } }),
      this.prisma.projet.count({ where: { organisationId, statut: 'EN_PAUSE' } }),
    ]);
    return { total, enCours, termines, enPause };
  }
}
