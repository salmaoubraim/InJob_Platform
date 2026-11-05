<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OffreEmploi extends Model
{
    protected $table = 'offres_emploi';

    protected $primaryKey = 'id_offre';

    public $timestamps = false;

    protected $fillable = [
        'id_recruteur',
        'id_categorie',
        'id_metier',
        'titre',
        'description',
        'image_offre',
        'ville',
        'type_contrat',
        'salaire',
        'nombre_postes',
        'date_publication',
        'date_expiration',
        'statut',
        'est_publie',
        'est_masquee',
    ];

    protected function casts(): array
    {
        return [
            'date_publication' => 'date',
            'date_expiration' => 'date',
            'salaire' => 'decimal:2',
            'est_publie' => 'boolean',
            'est_masquee' => 'boolean',
        ];
    }

    public function recruteur(): BelongsTo
    {
        return $this->belongsTo(Recruteur::class, 'id_recruteur', 'id_recruteur');
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie', 'id_categorie');
    }

    public function metier(): BelongsTo
    {
        return $this->belongsTo(Metier::class, 'id_metier', 'id_metier');
    }

    public function candidatures(): HasMany
    {
        return $this->hasMany(Candidature::class, 'id_offre', 'id_offre');
    }

    public function isAvailableForCandidature(): bool
    {
        if (! filter_var($this->est_publie, FILTER_VALIDATE_BOOLEAN)) {
            return false;
        }

        if (filter_var($this->est_masquee ?? false, FILTER_VALIDATE_BOOLEAN)) {
            return false;
        }

        $statut = strtolower(trim((string) ($this->statut ?? 'active')));
        if ($statut === 'suspendue') {
            return false;
        }
        if ($statut !== '' && ! in_array($statut, ['active', 'actif', 'publie', 'publiée', 'publiee'], true)) {
            return false;
        }

        if ($this->date_expiration) {
            return $this->date_expiration->format('Y-m-d') >= now()->format('Y-m-d');
        }

        return true;
    }

    public function scopePublishedActive($query)
    {
        return $query
            ->where('est_publie', true)
            ->where(function ($q) {
                $q->whereNull('statut')
                    ->orWhere('statut', '')
                    ->orWhereRaw('LOWER(statut) IN (?, ?, ?, ?, ?)', [
                        'active', 'actif', 'publie', 'publiée', 'publiee',
                    ]);
            });
    }

    /** Offres visibles dans l'espace candidat (même règles que GET /offres). */
    public function scopeVisibleToCandidat($query)
    {
        return $query
            ->publishedActive()
            ->where('est_masquee', false)
            ->where(function ($q) {
                $q->whereNull('date_expiration')
                    ->orWhere('date_expiration', '>=', now()->toDateString());
            });
    }
}
