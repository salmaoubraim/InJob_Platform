<?php

namespace App\Support;

use App\Models\Metier;

class MetierResolver
{
    public static function findByName(string $name): ?Metier
    {
        $name = trim($name);
        if ($name === '') {
            return null;
        }

        $exact = Metier::query()
            ->whereRaw('LOWER(nom_metier) = ?', [mb_strtolower($name)])
            ->first();

        if ($exact) {
            return $exact;
        }

        return Metier::query()
            ->where('nom_metier', 'like', '%'.$name.'%')
            ->first();
    }

    public static function findIdByName(string $name): ?int
    {
        return self::findByName($name)?->id_metier;
    }

    /** @param  list<string>  $names */
    public static function findIdsByNames(array $names): array
    {
        $ids = [];
        foreach ($names as $name) {
            $id = self::findIdByName($name);
            if ($id) {
                $ids[] = $id;
            }
        }

        return array_values(array_unique($ids));
    }
}
