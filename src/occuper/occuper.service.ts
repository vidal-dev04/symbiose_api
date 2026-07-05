import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OccuperService {
  constructor(private prisma: PrismaService) {}

  async affecter(data: { adherentId: string; fonctionId: string; dateDebut?: Date }) {
    await this.prisma.occuper.updateMany({
      where: { fonctionId: data.fonctionId, actif: true },
      data: { actif: false, dateFin: new Date() },
    });
    return this.prisma.occuper.create({ data: { ...data, actif: true } });
  }

  async findByFonction(fonctionId: string) {
    return this.prisma.occuper.findMany({
      where: { fonctionId },
      include: { adherent: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { dateDebut: 'desc' },
    });
  }

  async findByAdherent(adherentId: string) {
    return this.prisma.occuper.findMany({
      where: { adherentId },
      include: { fonction: { select: { id: true, libelle: true } } },
      orderBy: { dateDebut: 'desc' },
    });
  }

  async terminer(id: string) {
    const occ = await this.prisma.occuper.findUnique({ where: { id } });
    if (!occ) throw new NotFoundException('Occupation introuvable');
    return this.prisma.occuper.update({
      where: { id },
      data: { actif: false, dateFin: new Date() },
    });
  }

  async remove(id: string) {
    return this.prisma.occuper.delete({ where: { id } });
  }
}
