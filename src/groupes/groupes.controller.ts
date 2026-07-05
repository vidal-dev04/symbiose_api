import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { GroupesService } from './groupes.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('groupes')
export class GroupesController {
  constructor(private readonly service: GroupesService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: { organisationId: string; nom: string; description?: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('organisationId') organisationId: string) {
    return this.service.findAll(organisationId);
  }

  @Get('adherent/:adherentId')
  mesGroupes(@Param('adherentId') adherentId: string) {
    return this.service.mesGroupes(adherentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post(':id/membres')
  ajouterMembre(@Param('id') groupeId: string, @Body('adherentId') adherentId: string) {
    return this.service.ajouterMembre(groupeId, adherentId);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Delete(':id/membres/:adherentId')
  retirerMembre(@Param('id') groupeId: string, @Param('adherentId') adherentId: string) {
    return this.service.retirerMembre(groupeId, adherentId);
  }
}
