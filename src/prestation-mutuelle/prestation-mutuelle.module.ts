import { Module } from '@nestjs/common';
import { PrestationMutuelleService } from './prestation-mutuelle.service';
import { PrestationMutuelleController } from './prestation-mutuelle.controller';

@Module({
  controllers: [PrestationMutuelleController],
  providers: [PrestationMutuelleService],
})
export class PrestationMutuelleModule {}
