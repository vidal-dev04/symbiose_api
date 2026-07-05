import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { RelationAdherentService } from './relation-adherent.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('relation-adherent')
export class RelationAdherentController {
  constructor(private service: RelationAdherentService) {}

  @Get()
  @Roles(Role.ADHERENT, Role.ADMIN_ORG)
  findAll(@Query('adherentId') adherentId: string) {
    return this.service.findAll(adherentId);
  }

  @Post()
  @Roles(Role.ADHERENT, Role.ADMIN_ORG)
  create(@Body() data: { adherentId: string; adherentLieId: string; typeRelation: string }) {
    return this.service.create(data);
  }

  @Delete(':id')
  @Roles(Role.ADHERENT, Role.ADMIN_ORG)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
