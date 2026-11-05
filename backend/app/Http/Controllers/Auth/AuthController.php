<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Administrateur;
use App\Models\Candidat;
use App\Models\Recruteur;
use App\Models\Utilisateur;
use App\Services\NotificationService;
use App\Support\RecruteurDomainSync;
use App\Support\UserPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:utilisateurs,email'],
            'mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', Rule::in(['candidat', 'recruteur', 'admin'])],
            'id_categorie' => ['required_if:role,candidat', 'nullable', 'integer', 'exists:categories,id_categorie'],
            'nom_entreprise' => ['required_if:role,recruteur', 'nullable', 'string', 'max:255'],
            'ville' => ['nullable', 'string', 'max:255'],
        ], [
            'email.unique' => 'Cet email est déjà utilisé.',
            'mot_de_passe.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'role.required' => 'Le rôle est obligatoire.',
            'nom_entreprise.required_if' => 'Le nom de l\'entreprise est obligatoire pour les recruteurs.',
        ]);

        $user = DB::transaction(function () use ($validated) {
            $utilisateur = Utilisateur::create([
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],
                'mot_de_passe' => $validated['mot_de_passe'],
                'telephone' => $validated['telephone'] ?? null,
                'role' => $validated['role'],
            ]);

            match ($validated['role']) {
                'candidat' => Candidat::create([
                    'id_user' => $utilisateur->id_user,
                    'id_categorie' => $validated['id_categorie'] ?? null,
                    'ville' => $validated['ville'] ?? null,
                ]),
                'recruteur' => Recruteur::create([
                    'id_user' => $utilisateur->id_user,
                    'nom_entreprise' => $validated['nom_entreprise'],
                    'ville' => $validated['ville'] ?? null,
                ]),
                'admin' => Administrateur::create(['id_user' => $utilisateur->id_user]),
            };

            return $utilisateur;
        });

        $token = $user->createToken('auth-token')->plainTextToken;

        $fresh = RecruteurDomainSync::syncForUser(
            $user->fresh()->load(['candidat.categorie', 'candidat.metier', 'candidat.competencesMetiers', 'recruteur.categorie', 'administrateur'])
        );
        $nomComplet = trim($fresh->prenom.' '.$fresh->nom);

        if ($fresh->role !== 'admin') {
            NotificationService::notifyAdmins(
                'inscription',
                'Nouvelle inscription',
                "{$nomComplet} s'est inscrit en tant que {$fresh->role}.",
                '/admin/utilisateurs'
            );
        }

        return response()->json([
            'message' => 'Inscription réussie.',
            'user' => $this->formatUser($fresh),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'mot_de_passe' => ['required', 'string'],
        ]);

        $email = strtolower(trim($credentials['email']));
        $user = Utilisateur::whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $user || ! $this->checkPassword($user, $credentials['mot_de_passe'])) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects. Vérifiez email et mot de passe, ou inscrivez-vous.'],
            ]);
        }

        if (isset($user->est_actif) && ! $user->est_actif) {
            throw ValidationException::withMessages([
                'email' => ['Votre compte est bloqué. Contactez le support InJob.'],
            ]);
        }
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie.',
            'user' => $this->formatUser(RecruteurDomainSync::syncForUser($user->load(['candidat.categorie', 'candidat.metier', 'candidat.competencesMetiers', 'recruteur.categorie', 'administrateur']))),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = RecruteurDomainSync::syncForUser(
            $request->user()->load(['candidat.categorie', 'candidat.metier', 'candidat.competencesMetiers', 'recruteur.categorie', 'administrateur'])
        );

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    /** Vérifie le mot de passe (bcrypt) ; répare les mots de passe en clair issus de phpMyAdmin. */
    private function checkPassword(Utilisateur $user, string $plain): bool
    {
        $stored = $user->getRawOriginal('mot_de_passe');

        if (Hash::check($plain, $stored)) {
            return true;
        }

        if ($stored === $plain) {
            $user->forceFill(['mot_de_passe' => $plain])->save();

            return true;
        }

        return false;
    }

    private function formatUser(Utilisateur $user): array
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
            'adresse' => $adresse,
            'candidat' => $user->candidat,
            'recruteur' => $user->recruteur,
            'administrateur' => $user->administrateur,
        ];
    }
}
