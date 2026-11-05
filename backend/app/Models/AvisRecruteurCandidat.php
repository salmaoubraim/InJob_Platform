<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvisRecruteurCandidat extends Model
{
    protected $table = 'avis_recruteur_candidat';

    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'id_recruteur',
        'id_candidat',
        'id_offre',
        'note',
        'commentaire',
        'created_at',
        'est_masque',
        'est_signale',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function recruteur(): BelongsTo
    {
        return $this->belongsTo(Recruteur::class, 'id_recruteur', 'id_recruteur');
    }

    public function candidat(): BelongsTo
    {
        return $this->belongsTo(Candidat::class, 'id_candidat', 'id_candidat');
    }

    public function offre(): BelongsTo
    {
        return $this->belongsTo(OffreEmploi::class, 'id_offre', 'id_offre');
    }
}
