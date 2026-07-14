import { Module } from '@nestjs/common';
import { ComptesService } from './comptes.service';
import { ComptesController } from './comptes.controller';

@Module({
  controllers: [ComptesController],
  providers: [ComptesService],
})
export class ComptesModule {}
