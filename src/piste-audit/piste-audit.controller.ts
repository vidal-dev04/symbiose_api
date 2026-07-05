import { Controller, Get, Query } from '@nestjs/common';
import { PisteAuditService } from './piste-audit.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('piste-audit')
export class PisteAuditController {
  constructor(private readonly service: PisteAuditService) {}

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Get()
  findAll(@Query('utilisateurId') utilisateurId?: string, @Query('limit') limit?: string) {
    return this.service.findAll(utilisateurId, limit ? parseInt(limit) : 50);
  }
}
