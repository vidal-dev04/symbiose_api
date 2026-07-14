import { Module } from '@nestjs/common';
import { CategorieAdherentService } from './categorie-adherent.service';
import { CategorieAdherentController } from './categorie-adherent.controller';

@Module({
  controllers: [CategorieAdherentController],
  providers: [CategorieAdherentService],
})
export class CategorieAdherentModule {}
