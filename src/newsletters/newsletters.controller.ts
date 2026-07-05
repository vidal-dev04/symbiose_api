import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly service: NewslettersService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: { organisationId: string; titre: string; contenu: string }) {
    return this.service.create(body);
  }

  @Get()
  findAll(@Query('organisationId') organisationId: string) {
    return this.service.findAll(organisationId);
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
  @Post(':id/envoyer')
  envoyer(@Param('id') id: string) {
    return this.service.envoyer(id);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
