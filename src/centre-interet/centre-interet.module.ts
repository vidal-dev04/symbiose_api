import { Module } from '@nestjs/common';
import { CentreInteretService } from './centre-interet.service';
import { CentreInteretController } from './centre-interet.controller';

@Module({
  controllers: [CentreInteretController],
  providers: [CentreInteretService],
})
export class CentreInteretModule {}
