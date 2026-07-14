import { Module } from '@nestjs/common';
import { GroupesUtilisateursService } from './groupes-utilisateurs.service';
import { GroupesUtilisateursController } from './groupes-utilisateurs.controller';

@Module({
  controllers: [GroupesUtilisateursController],
  providers: [GroupesUtilisateursService],
})
export class GroupesUtilisateursModule {}
