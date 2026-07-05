import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { EmailModule } from '../email/email.module';
import { IaModule } from '../ia/ia.module';

@Module({
  imports: [EmailModule, IaModule, ConfigModule],
  controllers: [OrganisationsController],
  providers: [OrganisationsService],
  exports: [OrganisationsService],
})
export class OrganisationsModule {}
