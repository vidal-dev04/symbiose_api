import { Module } from '@nestjs/common';
import { DomainesInterventionService } from './domaines-intervention.service';
import { DomainesInterventionController } from './domaines-intervention.controller';

@Module({
  controllers: [DomainesInterventionController],
  providers: [DomainesInterventionService],
  exports: [DomainesInterventionService],
})
export class DomainesInterventionModule {}
