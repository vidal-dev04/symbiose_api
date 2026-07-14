import { Module } from '@nestjs/common';
import { TypePrestataireService } from './type-prestataire.service';
import { TypePrestataireController } from './type-prestataire.controller';

@Module({
  controllers: [TypePrestataireController],
  providers: [TypePrestataireService],
})
export class TypePrestataireModule {}
