import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { AppartenanceGroupeService } from './appartenance-groupe.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('appartenance-groupe')
export class AppartenanceGroupeController {
  constructor(private service: AppartenanceGroupeService) {}

  @Get()
  @Roles(Role.ADMIN_ORG, Role.ADHERENT)
  findAll(@Query('groupeId') groupeId?: string, @Query('adherentId') adherentId?: string) {
    if (groupeId) return this.service.findByGroupe(groupeId);
    if (adherentId) return this.service.findByAdherent(adherentId);
    return [];
  }

  @Post()
  @Roles(Role.ADMIN_ORG)
  ajouter(@Body() data: { adherentId: string; groupeId: string }) {
    return this.service.ajouter(data);
  }

  @Delete(':adherentId/:groupeId')
  @Roles(Role.ADMIN_ORG)
  retirer(@Param('adherentId') adherentId: string, @Param('groupeId') groupeId: string) {
    return this.service.retirer(adherentId, groupeId);
  }
}
