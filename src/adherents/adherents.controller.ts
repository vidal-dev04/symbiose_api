import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { AdherentsService } from './adherents.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Role } from '@prisma/client';

@Controller('adherents')
export class AdherentsController {
  constructor(private service: AdherentsService) {}

  @Public()
  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_ORG)
  @RequirePermission('adherents.voir')
  find(@Query('organisationId') organisationId?: string) {
    if (organisationId) return this.service.findByOrganisation(organisationId);
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/valider')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_ORG)
  valider(@Param('id') id: string) {
    return this.service.valider(id);
  }

  @Patch(':id/refuser')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_ORG)
  refuser(@Param('id') id: string, @Body('motif') motif: string) {
    return this.service.refuser(id, motif);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() data: { nom?: string; prenom?: string }) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('adherents.supprimer')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
