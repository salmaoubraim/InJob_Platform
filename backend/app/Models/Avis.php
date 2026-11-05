<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Avis extends Model
{
    protected $table = 'avis';

    protected $primaryKey = 'id_avis';

    public $timestamps = false;

    protected $fillable = [
        'id_user',
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

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }

    public function offre(): BelongsTo
    {
        return $this->belongsTo(OffreEmploi::class, 'id_offre', 'id_offre');
    }
}
