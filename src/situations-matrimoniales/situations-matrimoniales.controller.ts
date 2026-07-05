import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { SituationsMatrimonialesService } from './situations-matrimoniales.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('situations-matrimoniales')
export class SituationsMatrimonialesController {
  constructor(private service: SituationsMatrimonialesService) {}

  @Public()
  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  @Roles(Role.SUPER_ADMIN)
  create(@Body() data: { code: string; libelle: string }) {
    return this.service.create(data);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
