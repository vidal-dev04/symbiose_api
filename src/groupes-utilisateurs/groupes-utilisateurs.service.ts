import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSION_CODES } from '../common/permissions';

interface GroupeInput {
  code: string;
  libelle: string;
  description?: string;
  permissions?: string[];
  actif?: boolean;
}

@Injectable()
export class GroupesUtilisateursService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.groupeUtilisateur.findMany({
      include: { _count: { select: { utilisateurs: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const groupe = await this.prisma.groupeUtilisateur.findUnique({ where: { id } });
    if (!groupe) throw new NotFoundException('Groupe introuvable');
    return groupe;
  }

  private validerPermissions(permissions?: string[]): void {
    if (!permissions) return;
    const inconnues = permissions.filter((p) => !PERMISSION_CODES.includes(p));
    if (inconnues.length > 0) throw new BadRequestException(`Permission(s) inconnue(s) : ${inconnues.join(', ')}`);
  }

  async create(data: GroupeInput) {
    this.validerPermissions(data.permissions);
    return this.prisma.groupeUtilisateur.create({
      data: { ...data, code: data.code.toUpperCase(), permissions: data.permissions ?? [] },
    });
  }

  async update(id: string, data: Partial<GroupeInput>) {
    await this.findOne(id);
    this.validerPermissions(data.permissions);
    return this.prisma.groupeUtilisateur.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    const enUsage = await this.prisma.utilisateur.count({ where: { groupeId: id } });
    if (enUsage > 0) throw new BadRequestException('Ce groupe est assigné à des comptes, il ne peut pas être supprimé');
    return this.prisma.groupeUtilisateur.delete({ where: { id } });
  }
}
