import { Module } from '@nestjs/common';
import { BudgetAnnuelService } from './budget-annuel.service';
import { BudgetAnnuelController } from './budget-annuel.controller';

@Module({
  controllers: [BudgetAnnuelController],
  providers: [BudgetAnnuelService],
})
export class BudgetAnnuelModule {}
