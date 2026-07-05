import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { EvenementProduitService } from './evenement-produit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('evenement-produit')
export class EvenementProduitController {
  constructor(private service: EvenementProduitService) {}

  @Get()
  @Roles(Role.ADMIN_ORG, Role.ADHERENT)
  findAll(@Query('evenementId') evenementId?: string, @Query('adherentId') adherentId?: string) {
    if (evenementId) return this.service.findByEvenement(evenementId);
    if (adherentId) return this.service.findByAdherent(adherentId);
    return [];
  }

  @Post()
  @Roles(Role.ADHERENT, Role.ADMIN_ORG)
  inscrire(@Body() data: { evenementId: string; adherentId: string }) {
    return this.service.inscrire(data);
  }

  @Patch(':evenementId/:adherentId/annuler')
  @Roles(Role.ADHERENT, Role.ADMIN_ORG)
  annuler(@Param('evenementId') evenementId: string, @Param('adherentId') adherentId: string) {
    return this.service.annuler(evenementId, adherentId);
  }
}
