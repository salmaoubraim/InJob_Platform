<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Metier extends Model
{
    protected $table = 'metiers';

    protected $primaryKey = 'id_metier';

    protected $fillable = ['id_categorie', 'nom_metier', 'description'];

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie', 'id_categorie');
    }

    public function offres(): HasMany
    {
        return $this->hasMany(OffreEmploi::class, 'id_metier', 'id_metier');
    }
}
