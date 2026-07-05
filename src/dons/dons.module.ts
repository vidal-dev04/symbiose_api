import { Module } from '@nestjs/common';
import { DonsService } from './dons.service';
import { DonsController } from './dons.controller';

@Module({
  controllers: [DonsController],
  providers: [DonsService],
  exports: [DonsService],
})
export class DonsModule {}
