import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { AdherentsModule } from './adherents/adherents.module';
import { PaiementsModule } from './paiements/paiements.module';
import { PaysModule } from './pays/pays.module';
import { CronModule } from './cron/cron.module';
import { UploadsModule } from './uploads/uploads.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CotisationsModule } from './cotisations/cotisations.module';
import { CaissesModule } from './caisses/caisses.module';
import { EvenementsModule } from './evenements/evenements.module';
import { MessagesModule } from './messages/messages.module';
import { DocumentsOfficielsModule } from './documents-officiels/documents-officiels.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { DonsModule } from './dons/dons.module';
import { ProjetsModule } from './projets/projets.module';
import { GroupesModule } from './groupes/groupes.module';
import { PrestationsModule } from './prestations/prestations.module';
import { BeneficiairesModule } from './beneficiaires/beneficiaires.module';
import { FonctionsModule } from './fonctions/fonctions.module';
import { FiliationModule } from './filiation/filiation.module';
import { PisteAuditModule } from './piste-audit/piste-audit.module';
import { DeviseModule } from './devise/devise.module';
import { DomainesInterventionModule } from './domaines-intervention/domaines-intervention.module';
import { SituationsMatrimonialesModule } from './situations-matrimoniales/situations-matrimoniales.module';
import { OccuperModule } from './occuper/occuper.module';
import { HabitationModule } from './habitation/habitation.module';
import { RelationAdherentModule } from './relation-adherent/relation-adherent.module';
import { AppartenanceGroupeModule } from './appartenance-groupe/appartenance-groupe.module';
import { EvenementProduitModule } from './evenement-produit/evenement-produit.module';
import { TypeOrganisationModule } from './type-organisation/type-organisation.module';
import { MembresOrganisationModule } from './membres-organisation/membres-organisation.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OpportunitesModule } from './opportunites/opportunites.module';
import { GroupesUtilisateursModule } from './groupes-utilisateurs/groupes-utilisateurs.module';
import { ComptesModule } from './comptes/comptes.module';
import { LienParenteModule } from './lien-parente/lien-parente.module';
import { CategoriePrestationModule } from './categorie-prestation/categorie-prestation.module';
import { TypePrestataireModule } from './type-prestataire/type-prestataire.module';
import { TypeMutuelleModule } from './type-mutuelle/type-mutuelle.module';
import { TypeAssociationModule } from './type-association/type-association.module';
import { PrestationMutuelleModule } from './prestation-mutuelle/prestation-mutuelle.module';
import { SourceFinancementModule } from './source-financement/source-financement.module';
import { BudgetAnnuelModule } from './budget-annuel/budget-annuel.module';
import { SecteurActiviteModule } from './secteur-activite/secteur-activite.module';
import { CentreInteretModule } from './centre-interet/centre-interet.module';
import { CategorieAdherentModule } from './categorie-adherent/categorie-adherent.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RootGuard } from './common/guards/root.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    EmailModule,
    OrganisationsModule,
    AdherentsModule,
    PaiementsModule,
    PaysModule,
    CronModule,
    UploadsModule,
    NotificationsModule,
    CotisationsModule,
    CaissesModule,
    EvenementsModule,
    MessagesModule,
    DocumentsOfficielsModule,
    NewslettersModule,
    DonsModule,
    ProjetsModule,
    GroupesModule,
    PrestationsModule,
    BeneficiairesModule,
    FonctionsModule,
    FiliationModule,
    PisteAuditModule,
    DeviseModule,
    DomainesInterventionModule,
    SituationsMatrimonialesModule,
    OccuperModule,
    HabitationModule,
    RelationAdherentModule,
    AppartenanceGroupeModule,
    EvenementProduitModule,
    TypeOrganisationModule,
    MembresOrganisationModule,
    DashboardModule,
    OpportunitesModule,
    GroupesUtilisateursModule,
    ComptesModule,
    LienParenteModule,
    CategoriePrestationModule,
    TypePrestataireModule,
    TypeMutuelleModule,
    TypeAssociationModule,
    PrestationMutuelleModule,
    SourceFinancementModule,
    BudgetAnnuelModule,
    SecteurActiviteModule,
    CentreInteretModule,
    CategorieAdherentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: RootGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
