import { Module } from '@nestjs/common';
import { SituationsMatrimonialesService } from './situations-matrimoniales.service';
import { SituationsMatrimonialesController } from './situations-matrimoniales.controller';

@Module({
  controllers: [SituationsMatrimonialesController],
  providers: [SituationsMatrimonialesService],
  exports: [SituationsMatrimonialesService],
})
export class SituationsMatrimonialesModule {}
