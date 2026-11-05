<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $table = 'notifications';

    protected $primaryKey = 'id_notification';

    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'type',
        'type_notification',
        'titre',
        'message',
        'contenu',
        'lien',
        'lu',
        'is_read',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'lu' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_user', 'id_user');
    }
}
