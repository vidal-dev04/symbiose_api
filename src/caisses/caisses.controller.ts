import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { CaissesService } from './caisses.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('caisses')
export class CaissesController {
  constructor(private readonly service: CaissesService) {}

  // ─── Caisses ────────────────────────────────────────────────────────────────

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post()
  createCaisse(@Body() body: { organisationId: string; libelle: string; devise?: string }) {
    return this.service.createCaisse(body);
  }

  @Get()
  findCaisses(@Query('organisationId') organisationId: string) {
    return this.service.findCaisses(organisationId);
  }

  @Get('stats')
  stats(@Query('organisationId') organisationId: string) {
    return this.service.stats(organisationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneCaisse(id);
  }

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { libelle?: string; actif?: boolean }) {
    return this.service.updateCaisse(id, body);
  }

  // ─── Transactions ────────────────────────────────────────────────────────────

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post(':id/transactions')
  addTransaction(
    @Param('id') caisseId: string,
    @Body() body: { organisationId: string; type: 'ENTREE' | 'SORTIE'; montant: number; libelle: string; reference?: string; dateTransaction?: string },
  ) {
    return this.service.addTransaction(caisseId, body);
  }

  @Get(':id/transactions')
  getTransactions(@Param('id') caisseId: string) {
    return this.service.getTransactions(caisseId);
  }

  // ─── Décaissements ───────────────────────────────────────────────────────────

  @Roles('ADMIN_ORG', 'SUPER_ADMIN')
  @Post('decaissements/create')
  createDecaissement(@Body() body: any) {
    return this.service.createDecaissement(body);
  }

  @Get('decaissements/list')
  getDecaissements(@Query('organisationId') organisationId: string) {
    return this.service.getDecaissements(organisationId);
  }
}
