import { Module } from '@nestjs/common';
import { DonsService } from './dons.service';
import { DonsController } from './dons.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DonsController],
  providers: [DonsService],
  exports: [DonsService],
})
export class DonsModule {}
