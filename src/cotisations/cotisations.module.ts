import { Module } from '@nestjs/common';
import { CotisationsService } from './cotisations.service';
import { CotisationsController } from './cotisations.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [CotisationsController],
  providers: [CotisationsService],
  exports: [CotisationsService],
})
export class CotisationsModule {}
