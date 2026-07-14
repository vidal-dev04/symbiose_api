import { Module } from '@nestjs/common';
import { CategoriePrestationService } from './categorie-prestation.service';
import { CategoriePrestationController } from './categorie-prestation.controller';

@Module({
  controllers: [CategoriePrestationController],
  providers: [CategoriePrestationService],
})
export class CategoriePrestationModule {}
