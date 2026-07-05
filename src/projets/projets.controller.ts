import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ProjetsService } from './projets.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('projets')
export class ProjetsController {
  constructor(private readonly service: ProjetsService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('organisationId') organisationId: string, @Query('statut') statut?: string) {
    return this.service.findAll(organisationId, statut);
  }

  @Get('stats')
  stats(@Query('organisationId') organisationId: string) {
    return this.service.stats(organisationId);
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

}
