# Connexion Google — InJob

Authentification OAuth 2.0 réelle (redirection Google + échange de code côté serveur).

## 1. Google Cloud Console

1. Ouvrez https://console.cloud.google.com/
2. Créez un projet (ex. `InJob`)
3. **APIs & Services** → **OAuth consent screen** → Type **Externe** → Remplissez nom + email de support
4. **Credentials** → **Create Credentials** → **OAuth client ID**
5. Type : **Application Web**
6. **Authorized JavaScript origins** :
   - `http://localhost`
7. **Authorized redirect URIs** :
   - `http://localhost/injob/auth/google/callback`
8. Copiez le **Client ID** et le **Client Secret**

## 2. Configuration InJob

### Frontend — `frontend/.env.xampp`

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
VITE_BASE_PATH=/injob
```

### Backend — `backend/.env`

```env
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-votre-secret
```

> Sans **Client ID** frontend : le bouton affiche un message d’aide.  
> Sans **Client Secret** backend : le retour OAuth après redirection échoue.

## 3. Base de données

```powershell
cd E:\inJob\backend
php artisan migrate --path=database/migrations/2026_06_06_000024_add_google_auth_to_utilisateurs.php
```

## 4. Build & déploiement

```powershell
cd E:\inJob\frontend
npm run build:xampp
```

Copiez `dist/` vers `C:\Users\Admin\Desktop\projets2\htdocs\injob\`.

## 5. Flux utilisateur

1. Clic sur **Se connecter avec Google**
2. Redirection vers Google → choix du compte → autorisation
3. Retour sur `/auth/google/callback`
4. **Compte existant** → connexion automatique → dashboard selon le rôle
5. **Nouveau compte** → modal choix candidat / recruteur → création du compte

## 6. Sécurité

- Vérification du token ID côté backend (`tokeninfo` + `aud` + `iss`)
- Échange du code OAuth uniquement côté serveur (secret jamais exposé au frontend)
- Liaison automatique si l’email existe déjà (évite les doublons)
- Colonnes `google_id` et `auth_provider` sur `utilisateurs`

## 7. Test

Sur http://localhost/injob/login → **Se connecter avec Google**.

Cas à vérifier :
- Nouveau compte Google → choix rôle → dashboard
- Email déjà inscrit → liaison + connexion
- Compte bloqué → message d’erreur explicite
- Autorisation refusée → message « Accès Google refusé »
