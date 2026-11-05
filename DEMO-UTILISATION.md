# InJob — Données de démonstration et parcours complet

## Installation des données

```bash
cd backend
php artisan migrate
php artisan db:seed
```

Ou exécuter dans phpMyAdmin : `backend/database/notifications_table.sql` puis les migrations.

Le seeder `DemoCompletSeeder` :
- Publie **toutes** les offres existantes (`est_publie = true`) — les anciennes offres restent en base
- Crée 4 candidats, CV, candidatures (statuts variés), messages et notifications

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@injob.ma | Admin@2024 |
| Recruteur (peinture) | recruteur.peinture@injob.ma | Recruteur@2024 |
| Recruteur (coiffure) | recruteur.coiffure@injob.ma | Recruteur@2024 |
| Candidat | omar.amrani@injob.ma | Candidat@2024 |
| Candidat | sara.amrani@injob.ma | Candidat@2024 |

## Parcours candidat → recruteur

1. **Candidat** : connexion → Profil / **Mon CV** → **Offres** → Postuler
2. **Recruteur** : notification cloche → **Candidatures reçues** → Profil / Télécharger CV → Changer statut (Acceptée, Refusée, **Entretien programmé**)
3. **Candidat** : notification + **Mes candidatures** → **Contacter le recruteur** (messagerie)
4. **Admin** : tableau de bord, utilisateurs, offres, statistiques (données API réelles)

## Pages principales

| Page | URL |
|------|-----|
| Accueil (6 offres récentes) | `/` |
| Toutes les offres (public) | `/offres` |
| Offres candidat | `/candidat/offres` |
| Candidatures | `/candidat/candidatures` ou `/recruteur/candidatures` |
| Notifications | `/{role}/notifications` |
| Admin utilisateurs | `/admin/utilisateurs` |

## Notifications (types)

- Nouvelle candidature
- Candidature acceptée / refusée
- Entretien programmé
- Nouveau message

Badge + menu déroulant : rafraîchissement toutes les 15 secondes.
