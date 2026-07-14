import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { CotisationsService } from './cotisations.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Role } from '@prisma/client';

@Controller('cotisations')
export class CotisationsController {
  constructor(private readonly service: CotisationsService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: { adherentId: string; organisationId: string; montant: number; periode: string; dateEcheance: string }) {
    return this.service.create(body);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post('batch')
  createBatch(@Body() body: { organisationId: string; montant: number; periode: string; dateEcheance: string }) {
    return this.service.createBatch(body.organisationId, body.montant, body.periode, body.dateEcheance);
  }

  @Get()
  findByOrganisation(@Query('organisationId') organisationId: string, @Query('statut') statut?: string) {
    return this.service.findByOrganisation(organisationId, statut);
  }

  @Get('stats')
  stats(@Query('organisationId') organisationId: string) {
    return this.service.stats(organisationId);
  }

  @Get('global')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('cotisations.voir')
  findGlobal(
    @Query('statut') statut?: string,
    @Query('organisationId') organisationId?: string,
    @Query('periode') periode?: string,
    @Query('paysId') paysId?: string,
  ) {
    return this.service.findGlobal({ statut, organisationId, periode, paysId });
  }

  @Get('global/stats')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('cotisations.voir')
  statsGlobal() {
    return this.service.statsGlobal();
  }

  @Get('adherent/:adherentId')
  findByAdherent(@Param('adherentId') adherentId: string) {
    return this.service.findByAdherent(adherentId);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Patch(':id/payer')
  payer(@Param('id') id: string) {
    return this.service.payer(id);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Patch(':id/annuler')
  annuler(@Param('id') id: string) {
    return this.service.annuler(id);
  }
}
