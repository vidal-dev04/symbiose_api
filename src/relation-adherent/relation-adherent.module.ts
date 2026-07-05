import { Module } from '@nestjs/common';
import { RelationAdherentService } from './relation-adherent.service';
import { RelationAdherentController } from './relation-adherent.controller';

@Module({
  controllers: [RelationAdherentController],
  providers: [RelationAdherentService],
  exports: [RelationAdherentService],
})
export class RelationAdherentModule {}
