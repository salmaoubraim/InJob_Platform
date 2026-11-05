<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Candidat extends Model
{
    protected $table = 'candidats';

    protected $primaryKey = 'id_candidat';

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'id_categorie',
        'id_metier',
        'date_naissance',
        'ville',
        'adresse',
        'competences',
        'experience',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
        ];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie', 'id_categorie');
    }

    public function metier(): BelongsTo
    {
        return $this->belongsTo(Metier::class, 'id_metier', 'id_metier');
    }

    public function competencesMetiers(): BelongsToMany
    {
        return $this->belongsToMany(
            Metier::class,
            'candidat_competences',
            'id_candidat',
            'id_metier',
            'id_candidat',
            'id_metier'
        );
    }

    public function candidatures(): HasMany
    {
        return $this->hasMany(Candidature::class, 'id_candidat', 'id_candidat');
    }

    public function cvs(): HasMany
    {
        return $this->hasMany(CV::class, 'id_candidat', 'id_candidat');
    }

    public function avisRecruteurs(): HasMany
    {
        return $this->hasMany(AvisRecruteurCandidat::class, 'id_candidat', 'id_candidat');
    }
}
