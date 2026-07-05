import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { FiliationService } from './filiation.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('filiation')
export class FiliationController {
  constructor(private readonly service: FiliationService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  lier(@Body('parentId') parentId: string, @Body('enfantId') enfantId: string) {
    return this.service.lier(parentId, enfantId);
  }

  @Get('enfants/:parentId')
  enfants(@Param('parentId') parentId: string) {
    return this.service.findEnfants(parentId);
  }

  @Get('parents/:enfantId')
  parents(@Param('enfantId') enfantId: string) {
    return this.service.findParents(enfantId);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Delete(':parentId/:enfantId')
  supprimer(@Param('parentId') parentId: string, @Param('enfantId') enfantId: string) {
    return this.service.supprimer(parentId, enfantId);
  }
}
