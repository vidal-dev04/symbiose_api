import { Module } from '@nestjs/common';
import { AppartenanceGroupeService } from './appartenance-groupe.service';
import { AppartenanceGroupeController } from './appartenance-groupe.controller';

@Module({
  controllers: [AppartenanceGroupeController],
  providers: [AppartenanceGroupeService],
  exports: [AppartenanceGroupeService],
})
export class AppartenanceGroupeModule {}
