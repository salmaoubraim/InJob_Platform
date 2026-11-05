<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Candidature extends Model
{
    protected $table = 'candidatures';

    protected $primaryKey = 'id_candidature';

    public $timestamps = false;

    protected $fillable = [
        'id_offre',
        'id_candidat',
        'statut',
        'date_candidature',
        'date_entretien',
    ];

    protected function casts(): array
    {
        return [
            'date_candidature' => 'datetime',
            'date_entretien' => 'datetime',
        ];
    }

    public function offre(): BelongsTo
    {
        return $this->belongsTo(OffreEmploi::class, 'id_offre', 'id_offre');
    }

    public function candidat(): BelongsTo
    {
        return $this->belongsTo(Candidat::class, 'id_candidat', 'id_candidat');
    }
}
