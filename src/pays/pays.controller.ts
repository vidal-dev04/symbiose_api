import { Controller, Get, Post, Param, Body } from '@nestjs/common';
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

  @Post(':id/villes')
  @Roles(Role.SUPER_ADMIN)
  addVille(@Param('id') paysId: string, @Body('nom') nom: string) {
    return this.service.addVille(paysId, nom);
  }
}
