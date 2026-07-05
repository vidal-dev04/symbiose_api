import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { PaysService } from './pays.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('pays')
export class PaysController {
  constructor(private service: PaysService) {}

  @Public()
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() data: { code: string; nom: string; drapeau?: string }) {
    return this.service.create(data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() data: { nom?: string; drapeau?: string; armoirieUrl?: string; actif?: boolean }) {
    return this.service.update(id, data);
  }

  @Patch(':id/armoirie')
  @Roles(Role.SUPER_ADMIN)
  setArmoirie(@Param('id') id: string, @Body('armoirieUrl') armoirieUrl: string) {
    return this.service.setArmoirie(id, armoirieUrl);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/villes')
  @Roles(Role.SUPER_ADMIN)
  addVille(@Param('id') paysId: string, @Body('nom') nom: string) {
    return this.service.addVille(paysId, nom);
  }

  @Delete('villes/:villeId')
  @Roles(Role.SUPER_ADMIN)
  deleteVille(@Param('villeId') villeId: string) {
    return this.service.deleteVille(villeId);
  }

  @Get('admin/all')
  @Roles(Role.SUPER_ADMIN)
  findAllAdmin() {
    return this.service.findAllIncludingInactive();
  }
}
