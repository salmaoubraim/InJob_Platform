# InJob sur XAMPP — localhost (projets2)

Votre XAMPP **actif** (Apache) est ici :

```
C:\Users\Admin\Desktop\file reste dans s4 et pfe\projets2
```

Les pages web sont servies depuis :

```
C:\Users\Admin\Desktop\projets2\htdocs
```

Le projet InJob reste ici :

```
E:\inJob
```

Apache est configuré pour servir InJob **sans** `php artisan serve`.

## URLs

| Service | URL |
|---------|-----|
| **Application React** | http://localhost/injob |
| **API Laravel (MVC)** | http://localhost/injob-api |
| **phpMyAdmin** | http://localhost/phpmyadmin |

## Démarrage (à chaque session)

### 1. XAMPP Control Panel

Ouvrir : `C:\Users\Admin\Desktop\projets2\xampp-control.exe`

- **Apache** → Start  
- **MySQL** → Start  

### 2. Base de données (une fois)

Dans phpMyAdmin, créer la base :

```sql
CREATE DATABASE injob_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend Laravel

```powershell
cd E:\inJob\backend
C:\Users\Admin\Desktop\projets2\php\php.exe C:\Users\Admin\Desktop\projets2\php\composer.phar install
copy .env.example .env
C:\Users\Admin\Desktop\projets2\php\php.exe artisan key:generate
C:\Users\Admin\Desktop\projets2\php\php.exe artisan migrate
```

Fichier `.env` important :

```env
APP_URL=http://localhost/injob-api
DB_DATABASE=injob_platform
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Build frontend pour localhost

```powershell
cd E:\inJob\frontend
npm run build:xampp
```

Ou double-clic : `E:\inJob\scripts\demarrer-injob-xampp.bat`

### 5. Redémarrer Apache

Après la première config, **Stop** puis **Start** Apache dans XAMPP.

### 6. Ouvrir l'application

**http://localhost/injob**

---

## Architecture MVC (backend)

```
E:\inJob\backend\
├── app\Models/              → Modèle (M)
├── app\Http\Controllers/  → Contrôleur (C)
└── routes/api.php           → Routes API
```

Le frontend React (`E:\inJob\frontend`) appelle l'API via `http://localhost/injob-api/api`.

---

## Fichier Apache ajouté

`C:\Users\Admin\Desktop\projets2\apache\conf\extra\httpd-injob.conf`

Inclus dans `httpd.conf` — ne pas supprimer.

---

## Mode développement (optionnel)

Si vous préférez Vite en direct :

```powershell
cd E:\inJob\frontend
npm run dev
```

→ http://localhost:5173 (API peut rester sur `php artisan serve` ou localhost/injob-api)

---

## Dépannage

| Problème | Solution |
|----------|----------|
| 404 sur `/injob` | `npm run build:xampp` puis redémarrer Apache |
| 404 sur `/injob-api` | Vérifier que `E:\inJob\backend\public` existe |
| Erreur base | MySQL démarré + base `injob_platform` créée |
| Page blanche React | Vider le cache, vérifier `dist/` après build |
