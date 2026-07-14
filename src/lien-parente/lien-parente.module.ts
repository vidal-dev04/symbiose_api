import { Module } from '@nestjs/common';
import { LienParenteService } from './lien-parente.service';
import { LienParenteController } from './lien-parente.controller';

@Module({
  controllers: [LienParenteController],
  providers: [LienParenteService],
})
export class LienParenteModule {}
