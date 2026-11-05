<?php

namespace App\Support;

use App\Models\OffreEmploi;

/** Images par défaut par métier (Unsplash, usage démo). */
class OffreImages
{
    public const PEINTURE = 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=400&fit=crop';

    public const COIFFURE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop';

    public const MENAGE = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop';

    public const BOUTIQUE = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop';

    public const INFIRMIERE = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop';

    public const AVOCAT = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop';

    public const DEV = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop';

    public const DEV_FULLSTACK = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop';

    public const DEV_PHP = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop';

    public const DEV_FRONTEND = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop';

    public const MARKETING = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop';

    public const MARKETING_DIGITAL = 'https://images.unsplash.com/photo-1533750349088-cd871a166879?w=600&h=400&fit=crop';

    public const COMPTABLE = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop';

    public const DESIGN = 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop';

    /** Mots-clés titre → image métier (évite avocat sur infirmier, etc.). */
    private const TITRE_KEYWORDS = [
        'peint' => self::PEINTURE,
        'coiff' => self::COIFFURE,
        'ménage' => self::MENAGE,
        'menage' => self::MENAGE,
        'boutique' => self::BOUTIQUE,
        'infirm' => self::INFIRMIERE,
        'avocat' => self::AVOCAT,
        'jurid' => self::AVOCAT,
        'assistant(e) avocat' => self::AVOCAT,
        'responsable marketing' => self::MARKETING_DIGITAL,
        'chargé marketing' => self::MARKETING_DIGITAL,
        'marketing digital' => self::MARKETING_DIGITAL,
        'full stack' => self::DEV_FULLSTACK,
        'php laravel' => self::DEV_PHP,
        'laravel' => self::DEV_PHP,
        'php' => self::DEV_PHP,
        'frontend' => self::DEV_FRONTEND,
        'react' => self::DEV_FRONTEND,
        'développ' => self::DEV,
        'developp' => self::DEV,
        'marketing' => self::MARKETING,
        'comptab' => self::COMPTABLE,
        'design' => self::DESIGN,
        'ui/ux' => self::DESIGN,
    ];

    public static function url(?string $stored): ?string
    {
        if (! $stored) {
            return null;
        }

        if (str_starts_with($stored, 'http://') || str_starts_with($stored, 'https://')) {
            return $stored;
        }

        if (preg_match('/^[A-Za-z]:[\\\\\\/]/', $stored)) {
            return null;
        }

        if (str_starts_with($stored, '/storage/') || str_starts_with($stored, 'storage/')) {
            $path = str_starts_with($stored, '/') ? $stored : '/'.$stored;

            return url($path);
        }

        return url($stored);
    }

    public static function forTitre(string $titre): string
    {
        $t = mb_strtolower($titre);

        foreach (self::TITRE_KEYWORDS as $keyword => $image) {
            if (str_contains($t, $keyword)) {
                return $image;
            }
        }

        return self::DEV;
    }

    /** @return list<string> */
    public static function poolUrls(): array
    {
        return [
            self::PEINTURE,
            self::COIFFURE,
            self::MENAGE,
            self::BOUTIQUE,
            self::INFIRMIERE,
            self::AVOCAT,
            self::DEV,
            self::DEV_FULLSTACK,
            self::DEV_PHP,
            self::DEV_FRONTEND,
            self::MARKETING,
            self::MARKETING_DIGITAL,
            self::COMPTABLE,
            self::DESIGN,
        ];
    }

    public static function isPoolUrl(?string $url): bool
    {
        if (! $url) {
            return false;
        }

        foreach (self::poolUrls() as $pool) {
            if ($url === $pool) {
                return true;
            }
        }

        return str_contains($url, 'images.unsplash.com');
    }

    public static function forOffre(OffreEmploi $offre): string
    {
        $stored = self::url($offre->image_offre);
        if ($stored) {
            return $stored;
        }

        return self::forTitre($offre->titre ?? '');
    }
}
