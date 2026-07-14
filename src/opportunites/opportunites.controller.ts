import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { OpportunitesService } from './opportunites.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Role, TypeOpportunite } from '@prisma/client';

interface OpportuniteBody {
  titre: string;
  organisme: string;
  description: string;
  type?: TypeOpportunite;
  secteur: string;
  paysId?: string;
  montant?: string;
  dateLimite?: string;
  lienSource?: string;
}

@Controller('opportunites')
export class OpportunitesController {
  constructor(private service: OpportunitesService) {}

  @Public()
  @Get('publiees')
  findPubliees() {
    return this.service.findPubliees();
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('opportunites.voir')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('opportunites.voir')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('opportunites.creer')
  create(@Body() data: OpportuniteBody) {
    return this.service.create(data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('opportunites.creer')
  update(@Param('id') id: string, @Body() data: Partial<OpportuniteBody>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermission('opportunites.supprimer')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
