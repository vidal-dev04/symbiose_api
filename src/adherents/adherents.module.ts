import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdherentsService } from './adherents.service';
import { AdherentsController } from './adherents.controller';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ConfigModule, EmailModule, NotificationsModule],
  controllers: [AdherentsController],
  providers: [AdherentsService],
  exports: [AdherentsService],
})
export class AdherentsModule {}
