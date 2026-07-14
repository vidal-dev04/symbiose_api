import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ComptesService } from './comptes.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireRoot } from '../common/decorators/require-root.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('comptes')
@Roles(Role.SUPER_ADMIN)
@RequireRoot()
export class ComptesController {
  constructor(private service: ComptesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() data: { email: string; motDePasse: string; groupeId?: string }) {
    return this.service.create(data);
  }

  @Patch(':id/groupe')
  updateGroupe(@Param('id') id: string, @Body('groupeId') groupeId: string | null) {
    return this.service.updateGroupe(id, groupeId);
  }

  @Patch(':id/toggle-actif')
  toggleActif(@Param('id') id: string, @CurrentUser('id') requesterId: string) {
    return this.service.toggleActif(id, requesterId);
  }
}
