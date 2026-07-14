import { Module } from '@nestjs/common';
import { OpportunitesService } from './opportunites.service';
import { OpportunitesController } from './opportunites.controller';

@Module({
  controllers: [OpportunitesController],
  providers: [OpportunitesService],
  exports: [OpportunitesService],
})
export class OpportunitesModule {}
