import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { OccuperService } from './occuper.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('occuper')
export class OccuperController {
  constructor(private service: OccuperService) {}

  @Post()
  @Roles(Role.ADMIN_ORG)
  affecter(@Body() data: { adherentId: string; fonctionId: string; dateDebut?: Date }) {
    return this.service.affecter(data);
  }

  @Get()
  @Roles(Role.ADMIN_ORG, Role.ADHERENT)
  findAll(@Query('fonctionId') fonctionId?: string, @Query('adherentId') adherentId?: string) {
    if (fonctionId) return this.service.findByFonction(fonctionId);
    if (adherentId) return this.service.findByAdherent(adherentId);
    return [];
  }

  @Patch(':id/terminer')
  @Roles(Role.ADMIN_ORG)
  terminer(@Param('id') id: string) {
    return this.service.terminer(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_ORG)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
