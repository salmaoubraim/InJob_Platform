<?php

namespace App\Services;

use App\Models\Candidat;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use App\Support\RecruteurDomainSync;
use App\Support\UserPresenter;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleAuthService
{
    public function verifyIdToken(string $idToken): array
    {
        $response = Http::timeout(10)->get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $idToken,
        ]);

        if (! $response->ok()) {
            abort(422, 'Token Google invalide ou expiré.');
        }

        $data = $response->json();

        if (empty($data['email'])) {
            abort(422, 'Email Google non disponible.');
        }

        if (($data['email_verified'] ?? 'false') !== 'true' && ($data['email_verified'] ?? false) !== true) {
            abort(422, 'Votre adresse Google n\'est pas vérifiée.');
        }

        $clientId = config('services.google.client_id');
        if ($clientId && ($data['aud'] ?? '') !== $clientId) {
            abort(422, 'Application Google non autorisée.');
        }

        $iss = $data['iss'] ?? '';
        if (! in_array($iss, ['accounts.google.com', 'https://accounts.google.com'], true)) {
            abort(422, 'Émetteur du token Google non reconnu.');
        }

        return $this->normalizeGoogleProfile($data);
    }

    public function exchangeAuthorizationCode(string $code, string $redirectUri): array
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (! $clientId || ! $clientSecret) {
            abort(422, 'OAuth Google non configuré côté serveur (client secret manquant).');
        }

        $response = Http::asForm()->timeout(15)->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if (! $response->ok()) {
            Log::warning('Google token exchange failed', ['body' => $response->json()]);
            abort(422, 'Échange du code Google impossible. Réessayez.');
        }

        $idToken = $response->json('id_token');
        if (! $idToken) {
            abort(422, 'Réponse Google incomplète.');
        }

        return $this->verifyIdToken($idToken);
    }

    public function resolveLogin(Utilisateur $user, array $profile): Utilisateur
    {
        if (isset($user->est_actif) && ! $user->est_actif) {
            abort(422, 'Votre compte est bloqué. Contactez le support InJob.');
        }

        $updates = [];

        if (empty($user->google_id) && ! empty($profile['google_id'])) {
            $conflict = Utilisateur::where('google_id', $profile['google_id'])
                ->where('id_user', '!=', $user->id_user)
                ->exists();
            if ($conflict) {
                abort(422, 'Ce compte Google est déjà lié à un autre utilisateur.');
            }
            $updates['google_id'] = $profile['google_id'];
            $updates['auth_provider'] = 'google';
        }

        if (empty($user->photo_profil) && ! empty($profile['picture'])) {
            $updates['photo_profil'] = $this->storeAvatar($user->id_user, $profile['picture'])
                ?? $profile['picture'];
        }

        if ($updates) {
            $user->update($updates);
        }

        return RecruteurDomainSync::syncForUser(
            $user->fresh()->load(['candidat.categorie', 'candidat.metier', 'candidat.competencesMetiers', 'recruteur.categorie', 'administrateur'])
        );
    }

    public function findExistingUser(array $profile): ?Utilisateur
    {
        if (! empty($profile['google_id'])) {
            $byGoogle = Utilisateur::where('google_id', $profile['google_id'])->first();
            if ($byGoogle) {
                return $byGoogle;
            }
        }

        return Utilisateur::whereRaw('LOWER(email) = ?', [strtolower($profile['email'])])->first();
    }

    public function createGoogleUser(array $profile, string $role, array $extra = []): Utilisateur
    {
        $email = strtolower($profile['email']);

        if (Utilisateur::whereRaw('LOWER(email) = ?', [$email])->exists()) {
            abort(422, 'Cet email possède déjà un compte. Connectez-vous avec Google.');
        }

        if (! empty($profile['google_id']) && Utilisateur::where('google_id', $profile['google_id'])->exists()) {
            abort(422, 'Ce compte Google est déjà enregistré.');
        }

        $user = Utilisateur::create([
            'nom' => $profile['family_name'] ?? 'Utilisateur',
            'prenom' => $profile['given_name'] ?? 'Google',
            'email' => $email,
            'google_id' => $profile['google_id'] ?? null,
            'auth_provider' => 'google',
            'mot_de_passe' => bin2hex(random_bytes(24)),
            'telephone' => null,
            'photo_profil' => null,
            'role' => $role,
            'est_actif' => true,
        ]);

        if (! empty($profile['picture'])) {
            $stored = $this->storeAvatar($user->id_user, $profile['picture']);
            if ($stored) {
                $user->update(['photo_profil' => $stored]);
            } else {
                $user->update(['photo_profil' => $profile['picture']]);
            }
        }

        match ($role) {
            'candidat' => Candidat::create([
                'id_user' => $user->id_user,
                'ville' => $extra['ville'] ?? null,
            ]),
            'recruteur' => Recruteur::create([
                'id_user' => $user->id_user,
                'nom_entreprise' => $extra['nom_entreprise'] ?? 'Mon entreprise',
                'ville' => $extra['ville'] ?? null,
            ]),
            default => abort(422, 'Rôle non autorisé pour l\'inscription Google.'),
        };

        return RecruteurDomainSync::syncForUser(
            $user->fresh()->load(['candidat.categorie', 'candidat.metier', 'candidat.competencesMetiers', 'recruteur.categorie', 'administrateur'])
        );
    }

    public function formatUser(Utilisateur $user): array
    {
        $adresse = null;
        if ($user->role === 'candidat' && $user->candidat) {
            $adresse = $user->candidat->adresse;
        } elseif ($user->role === 'recruteur' && $user->recruteur) {
            $adresse = $user->recruteur->ville;
        }

        return [
            'id_user' => $user->id_user,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'photo_profil' => $user->photo_profil,
            'photo_url' => UserPresenter::photoUrl($user->photo_profil),
            'role' => $user->role,
            'auth_provider' => $user->auth_provider ?? 'local',
            'adresse' => $adresse,
            'candidat' => $user->candidat,
            'recruteur' => $user->recruteur,
            'administrateur' => $user->administrateur,
        ];
    }

    private function normalizeGoogleProfile(array $data): array
    {
        return [
            'google_id' => $data['sub'] ?? null,
            'email' => strtolower($data['email']),
            'given_name' => $data['given_name'] ?? Str::before($data['email'], '@'),
            'family_name' => $data['family_name'] ?? 'Utilisateur',
            'picture' => $data['picture'] ?? null,
            'email_verified' => ($data['email_verified'] ?? false) === true || ($data['email_verified'] ?? '') === 'true',
        ];
    }

    private function storeAvatar(int $userId, string $url): ?string
    {
        try {
            $response = Http::timeout(10)->get($url);
            if (! $response->ok()) {
                return null;
            }

            $dir = public_path('avatars');
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $ext = 'jpg';
            $name = 'user_'.$userId.'_google_'.time().'.'.$ext;
            file_put_contents($dir.DIRECTORY_SEPARATOR.$name, $response->body());

            return '/avatars/'.$name;
        } catch (\Throwable $e) {
            Log::warning('Google avatar download failed', ['user' => $userId, 'error' => $e->getMessage()]);

            return null;
        }
    }
}
