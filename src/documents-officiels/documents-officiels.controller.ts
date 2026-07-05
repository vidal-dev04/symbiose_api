import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { DocumentsOfficielsService } from './documents-officiels.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('documents-officiels')
export class DocumentsOfficielsController {
  constructor(private readonly service: DocumentsOfficielsService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('organisationId') organisationId: string, @Query('type') type?: string) {
    return this.service.findAll(organisationId, type);
  }

  @Get('expires-bientot')
  expiresBientot(@Query('organisationId') organisationId: string, @Query('jours') jours?: string) {
    return this.service.expiresBientot(organisationId, jours ? parseInt(jours) : 30);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
