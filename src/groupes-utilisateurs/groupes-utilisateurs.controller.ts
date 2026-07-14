import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { GroupesUtilisateursService } from './groupes-utilisateurs.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RequireRoot } from '../common/decorators/require-root.decorator';
import { Role } from '@prisma/client';
import { PERMISSIONS } from '../common/permissions';

interface GroupeBody {
  code: string;
  libelle: string;
  description?: string;
  permissions?: string[];
  actif?: boolean;
}

@Controller('groupes-utilisateurs')
@Roles(Role.SUPER_ADMIN)
@RequireRoot()
export class GroupesUtilisateursController {
  constructor(private service: GroupesUtilisateursService) {}

  @Get('permissions-catalogue')
  catalogue() {
    return PERMISSIONS;
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: GroupeBody) {
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<GroupeBody>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
