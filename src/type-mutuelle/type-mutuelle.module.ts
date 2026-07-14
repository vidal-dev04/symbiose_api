import { Module } from '@nestjs/common';
import { TypeMutuelleService } from './type-mutuelle.service';
import { TypeMutuelleController } from './type-mutuelle.controller';

@Module({
  controllers: [TypeMutuelleController],
  providers: [TypeMutuelleService],
})
export class TypeMutuelleModule {}
