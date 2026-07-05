import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { PaiementsService } from './paiements.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('paiements')
export class PaiementsController {
  constructor(private service: PaiementsService) {}

  @Public()
  @Post()
  initier(@Body() data: any) {
    return this.service.initierPaiement(data);
  }

  @Patch(':id/confirmer')
  @Roles(Role.SUPER_ADMIN)
  confirmer(@Param('id') id: string) {
    return this.service.confirmerPaiement(id);
  }

  @Public()
  @Post('payer-via-token')
  payerViaToken(@Body() body: { token: string; mode: string; infos: any }) {
    return this.service.payerViaToken(body.token, body.mode, body.infos);
  }

  @Public()
  @Post('payer-plus-tard')
  payerPlusTard(@Body() body: { organisationId: string; email: string; periode: string }) {
    return this.service.payerPlusTard(body.organisationId, body.email, body.periode);
  }

  @Public()
  @Get('token-info')
  tokenInfo(@Query('token') token: string) {
    return this.service.getTokenInfo(token);
  }

  @Get('token-info-org')
  tokenInfoOrg(@Query('organisationId') organisationId: string) {
    return this.service.getActiveTokenForOrg(organisationId);
  }

  @Get()
  findByOrganisation(@Query('organisationId') organisationId: string) {
    return this.service.findByOrganisation(organisationId);
  }
}
