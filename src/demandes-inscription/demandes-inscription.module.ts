import { Module } from '@nestjs/common';
import { DemandesInscriptionService } from './demandes-inscription.service';
import { DemandesInscriptionController } from './demandes-inscription.controller';

@Module({
  controllers: [DemandesInscriptionController],
  providers: [DemandesInscriptionService],
  exports: [DemandesInscriptionService],
})
export class DemandesInscriptionModule {}
