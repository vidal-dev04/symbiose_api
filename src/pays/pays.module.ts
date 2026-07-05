import { Module } from '@nestjs/common';
import { PaysService } from './pays.service';
import { PaysController } from './pays.controller';

@Module({
  controllers: [PaysController],
  providers: [PaysService],
  exports: [PaysService],
})
export class PaysModule {}
