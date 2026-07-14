import { Module } from '@nestjs/common';
import { SourceFinancementService } from './source-financement.service';
import { SourceFinancementController } from './source-financement.controller';

@Module({
  controllers: [SourceFinancementController],
  providers: [SourceFinancementService],
})
export class SourceFinancementModule {}
