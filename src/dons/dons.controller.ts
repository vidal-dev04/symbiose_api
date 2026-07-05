import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { DonsService } from './dons.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('dons')
export class DonsController {
  constructor(private readonly service: DonsService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('organisationId') organisationId: string) {
    return this.service.findAll(organisationId);
  }

  @Get('stats')
  stats(@Query('organisationId') organisationId: string) {
    return this.service.stats(organisationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
