<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $table = 'messages';

    protected $primaryKey = 'id_message';

    public $timestamps = false;

    protected $fillable = ['expediteur', 'destinataire', 'contenu', 'date_envoi', 'lu'];

    protected function casts(): array
    {
        return [
            'date_envoi' => 'datetime',
            'lu' => 'boolean',
        ];
    }

    public function expediteurUser(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'expediteur', 'id_user');
    }

    public function destinataireUser(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'destinataire', 'id_user');
    }
}
