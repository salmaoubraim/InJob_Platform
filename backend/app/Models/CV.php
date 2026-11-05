<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CV extends Model
{
    protected $table = 'cv';

    protected $primaryKey = 'id_cv';

    public $timestamps = false;

    protected $fillable = ['id_candidat', 'nom_fichier', 'chemin_fichier'];

    public function candidat(): BelongsTo
    {
        return $this->belongsTo(Candidat::class, 'id_candidat', 'id_candidat');
    }
}

