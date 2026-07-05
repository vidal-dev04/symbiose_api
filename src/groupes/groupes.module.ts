import { Module } from '@nestjs/common';
import { GroupesService } from './groupes.service';
import { GroupesController } from './groupes.controller';

@Module({
  controllers: [GroupesController],
  providers: [GroupesService],
  exports: [GroupesService],
})
export class GroupesModule {}
