<?php

namespace App\Support;

class UserPresenter
{
    public static function normalizePhotoPath(?string $photoPath): ?string
    {
        if (! $photoPath) {
            return null;
        }

        $photoPath = trim($photoPath);

        if (str_starts_with($photoPath, 'http://') || str_starts_with($photoPath, 'https://')) {
            return $photoPath;
        }

        if (! str_starts_with($photoPath, '/')) {
            if (is_file(public_path('avatars/'.$photoPath))) {
                return '/avatars/'.$photoPath;
            }
            if (is_file(public_path($photoPath))) {
                return '/'.$photoPath;
            }

            return '/avatars/'.$photoPath;
        }

        return $photoPath;
    }

    public static function photoUrl(?string $photoPath): ?string
    {
        $normalized = self::normalizePhotoPath($photoPath);
        if (! $normalized) {
            return null;
        }

        if (str_starts_with($normalized, 'http://') || str_starts_with($normalized, 'https://')) {
            return $normalized;
        }

        $url = url($normalized);
        $full = public_path(ltrim($normalized, '/'));

        if (is_file($full)) {
            $url .= '?v='.filemtime($full);
        }

        return $url;
    }

    /** @return array{prenom: ?string, nom: ?string, photo_profil: ?string, photo_url: ?string} */
    public static function avatarFields(?\App\Models\Utilisateur $user): array
    {
        if (! $user) {
            return [
                'prenom' => null,
                'nom' => null,
                'photo_profil' => null,
                'photo_url' => null,
            ];
        }

        return [
            'prenom' => $user->prenom,
            'nom' => $user->nom,
            'photo_profil' => $user->photo_profil,
            'photo_url' => self::photoUrl($user->photo_profil),
        ];
    }
}
