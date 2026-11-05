# InJob — Plateforme de mise en relation emploi (Maroc)

Application full-stack : API Laravel 11 + frontend React (Vite).

## Structure du projet

```
injob/
├── backend/     → API REST Laravel 11 + Sanctum + MySQL
└── frontend/    → Application React + Tailwind CSS
```

## XAMPP localhost (projets2 sur le Bureau)

Votre XAMPP : `C:\Users\Admin\Desktop\projets2`

| URL | Rôle |
|-----|------|
| http://localhost/injob | Application React |
| http://localhost/injob-api | API Laravel (MVC) |

Guide détaillé : **[XAMPP-LOCALHOST.md](./XAMPP-LOCALHOST.md)**

```powershell
cd E:\inJob\frontend
npm run build:xampp
# Puis Apache + MySQL dans XAMPP Control Panel
```

## Prérequis

- PHP 8.2+ (XAMPP projets2 : `C:\Users\Admin\Desktop\projets2\php\php.exe`)
- Composer 2.x
- MySQL (XAMPP)
- Node.js 18+

## Base de données

1. Créer la base MySQL :

```sql
CREATE DATABASE injob_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Configurer `backend/.env` (copier depuis `.env.example`) :

```env
DB_DATABASE=injob_platform
DB_USERNAME=root
DB_PASSWORD=
```

## Backend (Laravel)

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

API disponible sur : `http://127.0.0.1:8000`

### Endpoints d'authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/register` | Inscription (rôle obligatoire) |
| POST | `/api/login` | Connexion |
| POST | `/api/logout` | Déconnexion (Bearer token) |
| GET | `/api/user` | Utilisateur connecté |

## Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Application sur : `http://localhost:5173`

### Routes

| Route | Accès |
|-------|--------|
| `/login` | Public |
| `/register` | Public |
| `/candidat/dashboard` | Candidat |
| `/recruteur/dashboard` | Recruteur |
| `/admin/dashboard` | Admin |

## Modèles & tables

- `utilisateurs`, `candidats`, `recruteurs`, `administrateurs`
- `categories`, `offres_emploi`, `candidatures`, `cv`, `messages`

Relations Eloquent configurées dans `backend/app/Models/`.

## Palette UI

- Fond : `#E8E8F5`
- Primaire : `#4361EE`
- Police : Plus Jakarta Sans

## Données de démonstration

Voir **[DEMO-UTILISATION.md](./DEMO-UTILISATION.md)** — comptes de test, parcours candidat/recruteur, seeders.

```bash
php artisan migrate
php artisan db:seed
```

---

Projet académique — SFE InJob (Cahier des charges & document de conception).
