-- Ordre correct : enfants avant parents

DELETE FROM "GPOTB14";           -- EvenementProduit (-> Evenement, Adherent)
DELETE FROM "GPOTB38";           -- AppartenanceGroupe (-> GroupeAdherent, Adherent)
DELETE FROM "GPOTB23";           -- Occuper (-> Fonction, Adherent)
DELETE FROM "GPOTB18";           -- Habitation (-> Adherent)
DELETE FROM "GPOTB12";           -- RelationAdherent/Etre (-> Adherent)
DELETE FROM "GPOTB34";           -- DemandeInscription (-> Adherent, Organisation)
DELETE FROM "membre_organisation"; -- MembreOrganisation
DELETE FROM "GPOTB04";           -- Beneficiaire (-> Adherent)
DELETE FROM "GPOTB07";           -- Cotisation (-> Adherent, Organisation)
DELETE FROM "GPOTB43";           -- TokenPaiement (-> Adherent opt, Organisation opt)
DELETE FROM "GPOTB08";           -- Decaissement (-> Caisse, Organisation)
DELETE FROM "GPOTB11";           -- Don (-> Caisse, Organisation)
DELETE FROM "GPOTB32";           -- Transaction (-> Caisse, Organisation)
DELETE FROM "GPOTB05";           -- Caisse (-> Organisation)
DELETE FROM "GPOTB13";           -- Evenement (-> Organisation)
DELETE FROM "GPOTB15";           -- Filiation (-> Organisation x2)
DELETE FROM "GPOTB16";           -- Fonction (-> Organisation)
DELETE FROM "GPOTB17";           -- GroupeAdherent (-> Organisation)
DELETE FROM "GPOTB19";           -- Message (-> Organisation)
DELETE FROM "GPOTB21";           -- Newsletter (-> Organisation)
DELETE FROM "GPOTB28";           -- Prestation (-> Organisation)
DELETE FROM "GPOTB29";           -- Projet (-> Organisation)
DELETE FROM "GPOTB30";           -- RolePersonnalise (-> Organisation)
DELETE FROM "GPOTB35";           -- ReferenceOrganisation (-> Organisation)
DELETE FROM "GPOTB09";           -- DocumentOfficiel (-> Organisation)
DELETE FROM "GPOTB03";           -- Avoir (-> Organisation)
DELETE FROM "GPOTB42";           -- Document (-> Organisation)
DELETE FROM "GPOTB25";           -- Paiement (-> Organisation)
DELETE FROM "GPOTB41";           -- Abonnement (-> Organisation)
DELETE FROM "GPOTB39";           -- AdminOrganisation (-> Organisation, Utilisateur)
DELETE FROM "GPOTB01";           -- Adherent (-> Organisation, Utilisateur)
DELETE FROM "GPOTB24";           -- Organisation

-- Supprimer les notifications et connexions des users à supprimer
DELETE FROM "GPOTB22" WHERE "utilisateurId" IN (SELECT id FROM "GPOTB27" WHERE role IN ('ADMIN_ORG', 'ADHERENT'));
DELETE FROM "GPOTB06" WHERE "utilisateurId" IN (SELECT id FROM "GPOTB27" WHERE role IN ('ADMIN_ORG', 'ADHERENT'));
DELETE FROM "GPOTB36" WHERE "utilisateurId" IN (SELECT id FROM "GPOTB27" WHERE role IN ('ADMIN_ORG', 'ADHERENT'));

-- Supprimer les users ADMIN_ORG et ADHERENT (garder SUPER_ADMIN)
DELETE FROM "GPOTB27" WHERE role IN ('ADMIN_ORG', 'ADHERENT');
