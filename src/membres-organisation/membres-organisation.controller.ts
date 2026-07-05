import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { MembresOrganisationService } from './membres-organisation.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, RoleInterne, StatutMembre } from '@prisma/client';

@Controller('membres-organisation')
export class MembresOrganisationController {
  constructor(private readonly service: MembresOrganisationService) {}

  @Post()
  rejoindre(@Body() body: { adherentId: string; organisationId: string }) {
    return this.service.rejoindre(body.adherentId, body.organisationId);
  }

  @Get('par-organisation')
  @Roles(Role.ADMIN_ORG, Role.SUPER_ADMIN)
  findByOrganisation(@Query('organisationId') organisationId: string, @Query('statut') statut?: string) {
    return this.service.findByOrganisation(organisationId, statut);
  }

  @Get('par-adherent/:adherentId')
  findByAdherent(@Param('adherentId') adherentId: string) {
    return this.service.findByAdherent(adherentId);
  }

  @Patch(':id/valider')
  @Roles(Role.ADMIN_ORG, Role.SUPER_ADMIN)
  valider(@Param('id') id: string, @Body('acceptePar') acceptePar: string) {
    return this.service.valider(id, acceptePar);
  }

  @Patch(':id/refuser')
  @Roles(Role.ADMIN_ORG, Role.SUPER_ADMIN)
  refuser(@Param('id') id: string, @Body('motifRefus') motifRefus: string) {
    return this.service.refuser(id, motifRefus);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN_ORG, Role.SUPER_ADMIN)
  changerRole(@Param('id') id: string, @Body('roleInterne') roleInterne: RoleInterne) {
    return this.service.changerRole(id, roleInterne);
  }

  @Patch(':id/statut')
  @Roles(Role.ADMIN_ORG, Role.SUPER_ADMIN)
  changerStatut(@Param('id') id: string, @Body('statut') statut: StatutMembre) {
    return this.service.changerStatut(id, statut);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_ORG, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
