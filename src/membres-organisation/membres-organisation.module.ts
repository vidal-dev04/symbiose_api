import { Module } from '@nestjs/common';
import { MembresOrganisationService } from './membres-organisation.service';
import { MembresOrganisationController } from './membres-organisation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MembresOrganisationController],
  providers: [MembresOrganisationService],
  exports: [MembresOrganisationService],
})
export class MembresOrganisationModule {}
