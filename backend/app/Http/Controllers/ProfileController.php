<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Support\RecruteurDomainSync;
use App\Support\UserPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $request->user()->load(['candidat', 'recruteur', 'administrateur']);

        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('utilisateurs', 'email')->ignore($user->id_user, 'id_user'),
            ],
            'telephone' => ['nullable', 'string', 'max:20'],
            'adresse' => ['nullable', 'string', 'max:500'],
            'ville' => ['nullable', 'string', 'max:100'],
            'competences' => ['nullable', 'string', 'max:2000'],
            'experience' => ['nullable', 'string', 'max:2000'],
            'id_categorie' => ['nullable', 'integer', 'exists:categories,id_categorie'],
            'niveau_etude' => ['nullable', 'string', 'max:100'],
            'nom_entreprise' => ['nullable', 'string', 'max:255'],
            'description_entreprise' => ['nullable', 'string', 'max:5000'],
            'site_web' => ['nullable', 'string', 'max:255'],
        ], [
            'email.unique' => 'Cet email est déjà utilisé.',
        ]);

        $user->update([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => strtolower(trim($validated['email'])),
            'telephone' => $validated['telephone'] ?? null,
        ]);

        if ($user->role === 'candidat' && $user->candidat) {
            $user->candidat->update([
                'adresse' => $validated['adresse'] ?? $user->candidat->adresse,
                'ville' => $validated['ville'] ?? $validated['adresse'] ?? $user->candidat->ville,
                'competences' => $validated['competences'] ?? $user->candidat->competences,
                'experience' => $validated['experience'] ?? $user->candidat->experience,
                'id_categorie' => array_key_exists('id_categorie', $validated)
                    ? $validated['id_categorie']
                    : $user->candidat->id_categorie,
            ]);
        } elseif ($user->role === 'recruteur' && $user->recruteur) {
            $user->recruteur->update([
                'ville' => $validated['ville'] ?? $validated['adresse'] ?? $user->recruteur->ville,
                'nom_entreprise' => $validated['nom_entreprise'] ?? $user->recruteur->nom_entreprise,
                'description_entreprise' => $validated['description_entreprise'] ?? $user->recruteur->description_entreprise,
                'site_web' => $validated['site_web'] ?? $user->recruteur->site_web,
            ]);
        }

        if ($request->hasFile('photo')) {
            $request->validate([
                'photo' => ['image', 'max:2048'],
            ]);
            $this->deleteOldPhoto($user->photo_profil);

            $dir = public_path('avatars');
            if (! is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $file = $request->file('photo');
            $name = 'user_'.$user->id_user.'_'.time().'.'.$file->getClientOriginalExtension();
            $file->move($dir, $name);
            $user->update(['photo_profil' => '/avatars/'.$name]);
        } elseif ($request->boolean('remove_photo')) {
            $this->deleteOldPhoto($user->photo_profil);
            $user->update(['photo_profil' => null]);
        }

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => $this->formatUser(RecruteurDomainSync::syncForUser($user->fresh()->load(['candidat.categorie', 'candidat.metier', 'candidat.competencesMetiers', 'recruteur.categorie', 'administrateur']))),
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        /** @var Utilisateur $user */
        $user = $request->user();

        $validated = $request->validate([
            'mot_de_passe_actuel' => ['required', 'string'],
            'mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'mot_de_passe.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'mot_de_passe.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
        ]);

        if (! $this->checkPassword($user, $validated['mot_de_passe_actuel'])) {
            throw ValidationException::withMessages([
                'mot_de_passe_actuel' => ['Mot de passe actuel incorrect.'],
            ]);
        }

        $user->update(['mot_de_passe' => $validated['mot_de_passe']]);

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès.',
        ]);
    }

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

    private function deleteOldPhoto(?string $photoPath): void
    {
        if (! $photoPath) {
            return;
        }

        if (str_starts_with($photoPath, '/avatars/')) {
            $full = public_path(ltrim($photoPath, '/'));
            if (is_file($full)) {
                @unlink($full);
            }

            return;
        }

        if (str_starts_with($photoPath, '/storage/')) {
            $relative = str_replace('/storage/', '', $photoPath);
            Storage::disk('public')->delete($relative);
        }
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
