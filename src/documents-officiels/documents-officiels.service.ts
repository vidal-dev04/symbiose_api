import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsOfficielsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    organisationId: string;
    type: string;
    numero?: string;
    dateDelivrance?: string;
    dateExpiration?: string;
    autoriteEmettrice?: string;
    url?: string;
  }) {
    return this.prisma.documentOfficiel.create({
      data: {
        ...data,
        dateDelivrance: data.dateDelivrance ? new Date(data.dateDelivrance) : null,
        dateExpiration: data.dateExpiration ? new Date(data.dateExpiration) : null,
      },
    });
  }

  async findAll(organisationId?: string, type?: string) {
    return this.prisma.documentOfficiel.findMany({
      where: { ...(organisationId ? { organisationId } : {}), ...(type ? { type } : {}) },
      include: { organisation: { select: { nom: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.documentOfficiel.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable');
    return doc;
  }

  async update(id: string, data: { type?: string; numero?: string; url?: string; autoriteEmettrice?: string; dateExpiration?: string; valide?: boolean }) {
    return this.prisma.documentOfficiel.update({
      where: { id },
      data: {
        ...data,
        dateExpiration: data.dateExpiration ? new Date(data.dateExpiration) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.documentOfficiel.delete({ where: { id } });
  }

  async expiresBientot(organisationId: string, joursAvant = 30) {
    const limite = new Date();
    limite.setDate(limite.getDate() + joursAvant);
    return this.prisma.documentOfficiel.findMany({
      where: {
        organisationId,
        dateExpiration: { lte: limite, gte: new Date() },
      },
      orderBy: { dateExpiration: 'asc' },
    });
  }
}
