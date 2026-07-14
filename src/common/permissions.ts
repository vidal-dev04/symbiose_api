export interface PermissionDef {
  code: string;
  module: string;
  libelle: string;
}

export const PERMISSIONS: PermissionDef[] = [
  { code: 'organisations.voir', module: 'Organisations', libelle: 'Voir le menu Organisations (ONG, Mutuelles, Associations, Documents)' },
  { code: 'pays.voir', module: 'Pays', libelle: 'Voir le menu Pays' },
  { code: 'pays.modifier', module: 'Pays', libelle: 'Créer / modifier les pays et leurs villes' },
  { code: 'pays.supprimer', module: 'Pays', libelle: 'Activer / désactiver un pays' },
  { code: 'adherents.voir', module: 'Adhérents', libelle: 'Voir le menu Adhérents (et Documents Adhérent)' },
  { code: 'adherents.supprimer', module: 'Adhérents', libelle: 'Supprimer un adhérent' },
  { code: 'analyse_ia.voir', module: 'Analyse IA', libelle: 'Voir le menu Analyse IA' },
  { code: 'cotisations.voir', module: 'Cotisations', libelle: 'Voir le menu Cotisations (données financières)' },
  { code: 'opportunites.voir', module: 'Opportunités', libelle: 'Voir le menu Opportunités' },
  { code: 'opportunites.creer', module: 'Opportunités', libelle: 'Créer / modifier une opportunité' },
  { code: 'opportunites.supprimer', module: 'Opportunités', libelle: 'Supprimer une opportunité' },
  { code: 'parametres.voir', module: 'Paramètres', libelle: 'Voir les menus Paramètres généraux et spécifiques' },
  { code: 'utilisateurs.voir', module: 'Utilisateurs', libelle: "Voir la piste d'audit et les sauvegardes" },
];

export const PERMISSION_CODES = PERMISSIONS.map((p) => p.code);
