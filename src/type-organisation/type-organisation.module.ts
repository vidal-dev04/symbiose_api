import { Module } from '@nestjs/common';
import { TypeOrganisationService } from './type-organisation.service';
import { TypeOrganisationController } from './type-organisation.controller';

@Module({
  controllers: [TypeOrganisationController],
  providers: [TypeOrganisationService],
})
export class TypeOrganisationModule {}
