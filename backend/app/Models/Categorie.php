<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categorie extends Model
{
    protected $table = 'categories';

    protected $primaryKey = 'id_categorie';

    public $timestamps = false;

    protected $fillable = ['nom_categorie', 'description'];

    public function offres(): HasMany
    {
        return $this->hasMany(OffreEmploi::class, 'id_categorie', 'id_categorie');
    }

    public function metiers(): HasMany
    {
        return $this->hasMany(Metier::class, 'id_categorie', 'id_categorie');
    }

    public function candidats(): HasMany
    {
        return $this->hasMany(Candidat::class, 'id_categorie', 'id_categorie');
    }
}
