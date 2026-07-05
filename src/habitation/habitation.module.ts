import { Module } from '@nestjs/common';
import { HabitationService } from './habitation.service';
import { HabitationController } from './habitation.controller';

@Module({
  controllers: [HabitationController],
  providers: [HabitationService],
  exports: [HabitationService],
})
export class HabitationModule {}
