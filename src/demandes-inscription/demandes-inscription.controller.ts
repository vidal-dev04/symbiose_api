import { Controller, Get, Post, Patch, Param, Body, Query, Request } from '@nestjs/common';
import { DemandesInscriptionService } from './demandes-inscription.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('demandes-inscription')
export class DemandesInscriptionController {
  constructor(private service: DemandesInscriptionService) {}

  @Post()
  create(@Body() data: { organisationId?: string; adherentId?: string; type: string; donneesJson?: any }) {
    return this.service.create(data);
  }

  @Get()
  @Roles(Role.ADMIN_ORG)
  findAll(@Query('organisationId') organisationId: string, @Query('statut') statut?: string) {
    return this.service.findAll(organisationId, statut);
  }

  @Get('mes-demandes')
  @Roles(Role.ADHERENT)
  findMesDemandes(@Query('adherentId') adherentId: string) {
    return this.service.findByAdherent(adherentId);
  }

  @Patch(':id/accepter')
  @Roles(Role.ADMIN_ORG)
  accepter(@Param('id') id: string, @Body('traitePar') traitePar: string) {
    return this.service.accepter(id, traitePar);
  }

  @Patch(':id/refuser')
  @Roles(Role.ADMIN_ORG)
  refuser(@Param('id') id: string, @Body('motif') motif: string, @Body('traitePar') traitePar: string) {
    return this.service.refuser(id, motif, traitePar);
  }
}
