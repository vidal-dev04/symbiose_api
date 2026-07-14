import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TypeAssociationService } from './type-association.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Role } from '@prisma/client';

@Controller('type-association')
export class TypeAssociationController {
  constructor(private service: TypeAssociationService) {}

  @Public()
  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('parametres.voir')
  create(@Body() data: { code: string; libelle: string }) { return this.service.create(data); }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('parametres.voir')
  update(@Param('id') id: string, @Body() data: { libelle?: string; actif?: boolean }) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('parametres.voir')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
