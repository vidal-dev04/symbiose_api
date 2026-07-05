import { Module } from '@nestjs/common';
import { FonctionsService } from './fonctions.service';
import { FonctionsController } from './fonctions.controller';

@Module({
  controllers: [FonctionsController],
  providers: [FonctionsService],
  exports: [FonctionsService],
})
export class FonctionsModule {}
