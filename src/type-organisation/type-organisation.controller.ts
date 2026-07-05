import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { TypeOrganisationService } from './type-organisation.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('type-organisation')
export class TypeOrganisationController {
  constructor(private service: TypeOrganisationService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() data: { code: string; libelle: string }) { return this.service.create(data); }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() data: { libelle?: string; actif?: boolean }) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
