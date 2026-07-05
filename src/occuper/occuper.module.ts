import { Module } from '@nestjs/common';
import { OccuperService } from './occuper.service';
import { OccuperController } from './occuper.controller';

@Module({
  controllers: [OccuperController],
  providers: [OccuperService],
  exports: [OccuperService],
})
export class OccuperModule {}
