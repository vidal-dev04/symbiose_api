import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { BeneficiairesService } from './beneficiaires.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('beneficiaires')
export class BeneficiairesController {
  constructor(private readonly service: BeneficiairesService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Get()
  findAll(@Query('organisationId') organisationId?: string, @Query('adherentId') adherentId?: string) {
    if (adherentId) return this.service.findByAdherent(adherentId);
    return this.service.findAllByOrg(organisationId ?? '');
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
