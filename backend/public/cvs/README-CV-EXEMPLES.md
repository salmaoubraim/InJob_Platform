# CV PDF exemples — InJob

## Fichiers générés automatiquement

Après le seed, les PDF sont dans ce dossier :

| Fichier | Candidat |
|---------|----------|
| `cv_exemple_omar_alami.pdf` | Omar Alami |
| `cv_exemple_sara_bennani.pdf` | Sara Bennani |
| `cv_exemple_yassine_ouardi.pdf` | Yassine Ouardi |
| `cv_exemple_leila_mansouri.pdf` | Leila Mansouri |
| `cv_exemple_yassine_alaoui.pdf` | Yassine Alaoui (si compte existant) |

## Commande pour créer / mettre à jour les CV en base

```powershell
cd E:\inJob\backend
C:\Users\Admin\Desktop\projets2\php\php.exe artisan db:seed --class=CvDemoSeeder
```

## Ajouter votre propre CV PDF pour un candidat

### Option A — Interface (recommandé)

1. Connectez-vous en **candidat**
2. Allez sur **Mon CV**
3. Téléversez un fichier **PDF** (max 5 Mo)

### Option B — Manuel (fichier + base de données)

1. Copiez votre PDF ici : `backend/public/cvs/mon_cv.pdf`
2. Dans **phpMyAdmin**, table `cv` :

```sql
-- Remplacez ID_CANDIDAT par l'id du candidat (table candidats)
INSERT INTO cv (id_candidat, nom_fichier, chemin_fichier, created_at, updated_at)
VALUES (
  1,
  'Mon_CV.pdf',
  '/cvs/mon_cv.pdf',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  nom_fichier = VALUES(nom_fichier),
  chemin_fichier = VALUES(chemin_fichier),
  updated_at = NOW();
```

> Un candidat ne doit avoir qu’**un seul** CV actif (l’upload via l’app remplace l’ancien).

### Option C — Remplacer un exemple existant

1. Remplacez le contenu de `cv_exemple_omar_alami.pdf` par votre vrai PDF (même nom de fichier)
2. Ou mettez à jour `chemin_fichier` dans la table `cv`

## Colonnes table `cv`

| Colonne | Exemple |
|---------|---------|
| `id_candidat` | `1` |
| `nom_fichier` | `CV_Omar_Alami.pdf` (nom affiché au téléchargement) |
| `chemin_fichier` | `/cvs/cv_exemple_omar_alami.pdf` (URL relative depuis `public/`) |
