import { Controller, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { HabitationService } from './habitation.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('habitation')
export class HabitationController {
  constructor(private service: HabitationService) {}

  @Get(':adherentId')
  @Roles(Role.ADHERENT, Role.ADMIN_ORG)
  findOne(@Param('adherentId') adherentId: string) {
    return this.service.findByAdherent(adherentId);
  }

  @Put(':adherentId')
  @Roles(Role.ADHERENT, Role.ADMIN_ORG)
  upsert(
    @Param('adherentId') adherentId: string,
    @Body() data: { adresse?: string; quartier?: string; ville?: string; codePostal?: string; pays?: string; typeLogement?: string },
  ) {
    return this.service.upsert(adherentId, data);
  }

  @Delete(':adherentId')
  @Roles(Role.ADMIN_ORG)
  remove(@Param('adherentId') adherentId: string) {
    return this.service.remove(adherentId);
  }
}
