import { Module } from '@nestjs/common';
import { TypeAssociationService } from './type-association.service';
import { TypeAssociationController } from './type-association.controller';

@Module({
  controllers: [TypeAssociationController],
  providers: [TypeAssociationService],
})
export class TypeAssociationModule {}
