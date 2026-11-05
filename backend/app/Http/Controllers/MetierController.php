<?php

namespace App\Http\Controllers;

use App\Models\Metier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MetierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Metier::query()->with('categorie')->orderBy('nom_metier');

        if ($request->filled('id_categorie')) {
            $query->where('id_categorie', $request->id_categorie);
        }

        return response()->json([
            'data' => $query->get()->map(fn ($m) => [
                'id_metier' => $m->id_metier,
                'id_categorie' => $m->id_categorie,
                'nom_metier' => $m->nom_metier,
                'description' => $m->description,
                'categorie' => $m->categorie?->nom_categorie,
            ]),
        ]);
    }
}
