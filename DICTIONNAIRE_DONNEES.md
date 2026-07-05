# Dictionnaire de Données — Symbiose Pays API

Ce fichier décrit la correspondance entre les codes de tables (convention GPOTB)
et les entités métier du projet. Le préfixe **GPOTB** signifie **G**estion de
**P**lateforme **O**rganisations **T**iers **B**eneficiaires.

Dans le code source (Prisma / NestJS), les noms lisibles sont utilisés.
En base de données PostgreSQL, les tables portent les codes GPOTB définis via `@@map`.

---

## Tables existantes dans le projet

| Code      | Nom en base   | Modèle Prisma        | Description                                              |
|-----------|---------------|----------------------|----------------------------------------------------------|
| GPOTB01   | GPOTB01       | `Adherent`           | Membres adhérents d'une organisation                     |
| GPOTB24   | GPOTB24       | `Organisation`       | Organisations (ONG, Mutuelle, Association)               |
| GPOTB25   | GPOTB25       | `Paiement`           | Paiements d'abonnement à la plateforme                   |
| GPOTB26   | GPOTB26       | `Pays`               | Pays supportés par la plateforme                         |
| GPOTB27   | GPOTB27       | `Utilisateur`        | Comptes utilisateurs (auth, rôles, tokens)               |
| GPOTB39   | GPOTB39       | `AdminOrganisation`  | Table de liaison utilisateur ↔ organisation (admin)      |
| GPOTB40   | GPOTB40       | `Ville`              | Villes rattachées à un pays                              |
| GPOTB41   | GPOTB41       | `Abonnement`         | Abonnement actif d'une organisation à la plateforme      |
| GPOTB42   | GPOTB42       | `Document`           | Documents uploadés par une organisation                  |
| GPOTB43   | GPOTB43       | `TokenPaiement`      | Tokens temporaires pour paiement via lien email          |

---

## Tables prévues (à venir)

| Code      | Modèle prévu          | Description                                              |
|-----------|-----------------------|----------------------------------------------------------|
| GPOTB44   | `DemandeInscription`  | Demandes d'inscription analysées par IA (GROQ)           |

---

## Codes réservés (compatibilité avec le schéma de référence GPOTB)

Les codes suivants existent dans le schéma de référence du projet mais ne sont
pas encore implémentés dans cette version :

| Code    | Entité de référence         |
|---------|-----------------------------|
| GPOTB02 | Administrateur              |
| GPOTB03 | Avoir                       |
| GPOTB04 | Bénéficiaire                |
| GPOTB05 | Caisse                      |
| GPOTB06 | Connexion                   |
| GPOTB07 | Cotisation                  |
| GPOTB08 | Décaissement                |
| GPOTB09 | Document officiel           |
| GPOTB10 | Domaine d'intervention      |
| GPOTB11 | Dons                        |
| GPOTB12 | Être (relation adhérent)    |
| GPOTB13 | Événement                   |
| GPOTB14 | Événements produits         |
| GPOTB15 | Filiation                   |
| GPOTB16 | Fonction                    |
| GPOTB17 | Groupes adhérents           |
| GPOTB18 | Habitation                  |
| GPOTB19 | Message                     |
| GPOTB20 | Monnaie / Devise            |
| GPOTB21 | Newsletters                 |
| GPOTB22 | Notification                |
| GPOTB23 | Occuper (fonction occupée)  |
| GPOTB28 | Prestation                  |
| GPOTB29 | Projet                      |
| GPOTB30 | Rôle                        |
| GPOTB31 | Situation matrimoniale      |
| GPOTB32 | Transaction                 |
| GPOTB33 | Type d'organisation         |
| GPOTB34 | Demande d'inscription       |
| GPOTB35 | Référence organisation      |
| GPOTB36 | Piste d'audit               |
| GPOTB37 | Permission                  |
| GPOTB38 | Appartenance groupe         |

---

## Architecture technique

- **Base de données** : PostgreSQL (Prisma Postgres)
- **ORM** : Prisma v7 avec adaptateur `@prisma/adapter-pg`
- **Backend** : NestJS (TypeScript)
- **Convention** : Les noms de modèles Prisma sont en français lisible.
  Les noms de tables en base suivent la convention GPOTB via `@@map`.

---

## Exemple de correspondance dans le schéma Prisma

```prisma
model Organisation {
  id    String @id @default(uuid())
  nom   String
  ...
  @@map("GPOTB24")  // ← nom de la table en base de données
}
```

```typescript
// Dans le code NestJS, on utilise le nom lisible :
const orgs = await this.prisma.organisation.findMany();
// Prisma fait la traduction vers GPOTB24 automatiquement
```
