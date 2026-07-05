import { Module } from '@nestjs/common';
import { DeviseService } from './devise.service';
import { DeviseController } from './devise.controller';

@Module({
  controllers: [DeviseController],
  providers: [DeviseService],
  exports: [DeviseService],
})
export class DeviseModule {}
