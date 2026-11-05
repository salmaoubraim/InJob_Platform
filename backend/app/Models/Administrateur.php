<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Administrateur extends Model
{
    protected $table = 'administrateurs';

    protected $primaryKey = 'id_admin';

    public $timestamps = false;

    protected $fillable = ['id_user'];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }
}
