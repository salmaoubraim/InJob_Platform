<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\GoogleAuthService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GoogleAuthController extends Controller
{
    public function __construct(
        private readonly GoogleAuthService $googleAuth
    ) {}

    /**
     * Connexion via ID token (bouton Google / One Tap).
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credential' => ['required', 'string'],
        ]);

        $profile = $this->googleAuth->verifyIdToken($validated['credential']);

        return $this->authenticateProfile($profile, $validated['credential']);
    }

    /**
     * Connexion via code OAuth (redirection Google).
     */
    public function exchangeCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'redirect_uri' => ['required', 'url'],
        ]);

        $profile = $this->googleAuth->exchangeAuthorizationCode(
            $validated['code'],
            $validated['redirect_uri']
        );

        return $this->authenticateProfile($profile);
    }

    /**
     * Finaliser l'inscription Google (choix rôle candidat / recruteur).
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'credential' => ['required_without:code', 'nullable', 'string'],
            'code' => ['required_without:credential', 'nullable', 'string'],
            'redirect_uri' => ['required_with:code', 'nullable', 'url'],
            'role' => ['required', Rule::in(['candidat', 'recruteur'])],
            'ville' => ['nullable', 'string', 'max:255'],
            'nom_entreprise' => ['required_if:role,recruteur', 'nullable', 'string', 'max:255'],
        ], [
            'nom_entreprise.required_if' => 'Le nom de l\'entreprise est obligatoire pour les recruteurs.',
        ]);

        $profile = isset($validated['credential'])
            ? $this->googleAuth->verifyIdToken($validated['credential'])
            : $this->googleAuth->exchangeAuthorizationCode(
                $validated['code'],
                $validated['redirect_uri']
            );

        $user = $this->googleAuth->createGoogleUser($profile, $validated['role'], [
            'ville' => $validated['ville'] ?? null,
            'nom_entreprise' => $validated['nom_entreprise'] ?? null,
        ]);

        $nomComplet = trim($user->prenom.' '.$user->nom);
        NotificationService::notifyAdmins(
            'inscription',
            'Nouvelle inscription Google',
            "{$nomComplet} s'est inscrit en tant que {$user->role}.",
            '/admin/utilisateurs'
        );

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'is_new' => false,
            'message' => 'Compte Google créé avec succès.',
            'user' => $this->googleAuth->formatUser($user),
            'token' => $token,
        ], 201);
    }

    private function authenticateProfile(array $profile, ?string $credential = null): JsonResponse
    {
        $user = $this->googleAuth->findExistingUser($profile);

        if ($user) {
            $user = $this->googleAuth->resolveLogin($user, $profile);
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'is_new' => false,
                'message' => 'Connexion Google réussie.',
                'user' => $this->googleAuth->formatUser($user),
                'token' => $token,
            ]);
        }

        return response()->json([
            'is_new' => true,
            'email' => $profile['email'],
            'prenom' => $profile['given_name'],
            'nom' => $profile['family_name'],
            'photo' => $profile['picture'],
            'credential' => $credential,
        ]);
    }
}
