import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { EvenementsService } from './evenements.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('evenements')
export class EvenementsController {
  constructor(private readonly service: EvenementsService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('organisationId') organisationId: string) {
    return this.service.findAll(organisationId);
  }

  @Get('publics')
  publics(@Query('organisationId') organisationId: string) {
    return this.service.evenementsPublics(organisationId);
  }

  @Get('mes-participations/:adherentId')
  mesEvenements(@Param('adherentId') adherentId: string) {
    return this.service.mesEvenements(adherentId);
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

  @Post(':id/participer')
  participer(@Param('id') evenementId: string, @Body('adherentId') adherentId: string) {
    return this.service.participer(evenementId, adherentId);
  }

  @Delete(':id/participants/:adherentId')
  seDesinscrire(@Param('id') evenementId: string, @Param('adherentId') adherentId: string) {
    return this.service.seDesinscrire(evenementId, adherentId);
  }
}
