import { Module } from '@nestjs/common';
import { EvenementProduitService } from './evenement-produit.service';
import { EvenementProduitController } from './evenement-produit.controller';

@Module({
  controllers: [EvenementProduitController],
  providers: [EvenementProduitService],
  exports: [EvenementProduitService],
})
export class EvenementProduitModule {}
