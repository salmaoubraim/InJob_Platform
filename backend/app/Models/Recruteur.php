<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recruteur extends Model
{
    protected $table = 'recruteurs';

    protected $primaryKey = 'id_recruteur';

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'id_categorie',
        'nom_entreprise',
        'description_entreprise',
        'ville',
        'site_web',
        'logo',
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie', 'id_categorie');
    }

    public function offres(): HasMany
    {
        return $this->hasMany(OffreEmploi::class, 'id_recruteur', 'id_recruteur');
    }

    public function avisCandidats(): HasMany
    {
        return $this->hasMany(AvisRecruteurCandidat::class, 'id_recruteur', 'id_recruteur');
    }
}
