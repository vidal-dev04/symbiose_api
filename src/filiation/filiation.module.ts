import { Module } from '@nestjs/common';
import { FiliationService } from './filiation.service';
import { FiliationController } from './filiation.controller';

@Module({
  controllers: [FiliationController],
  providers: [FiliationService],
  exports: [FiliationService],
})
export class FiliationModule {}
