import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('organisations')
export class OrganisationsController {
  constructor(private service: OrganisationsService) {}

  @Public()
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('statut') statut?: string,
    @Query('paysId') paysId?: string,
  ) {
    return this.service.findAll({ type, statut, paysId });
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN)
  stats() {
    return this.service.stats();
  }

  @Get('analyse-ia')
  @Roles(Role.SUPER_ADMIN)
  analyseIaAll() {
    return this.service.analyseIaAll();
  }

  @Post(':id/analyser-ia')
  @Roles(Role.SUPER_ADMIN)
  analyserIa(@Param('id') id: string) {
    return this.service.analyserOrganisationIA(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_ORG)
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Patch(':id/statut')
  @Roles(Role.SUPER_ADMIN)
  updateStatut(@Param('id') id: string, @Body('statut') statut: string) {
    return this.service.updateStatut(id, statut);
  }

  @Patch(':id/valider')
  @Roles(Role.SUPER_ADMIN)
  valider(@Param('id') id: string) {
    return this.service.validerOrganisation(id);
  }

  @Patch(':id/refuser')
  @Roles(Role.SUPER_ADMIN)
  refuser(@Param('id') id: string, @Body('motif') motif: string) {
    return this.service.refuserOrganisation(id, motif);
  }

  @Post(':id/renvoyer-mail')
  @Roles(Role.SUPER_ADMIN)
  renvoyerMail(@Param('id') id: string) {
    return this.service.renvoyerMailOrganisation(id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
