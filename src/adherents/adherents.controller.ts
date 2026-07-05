import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { AdherentsService } from './adherents.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
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
}
