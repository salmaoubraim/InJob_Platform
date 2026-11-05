<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdminModerationLog extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'admin_moderation_logs';

    protected $fillable = [
        'id_user',
        'id_admin',
        'action',
        'message',
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

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_admin', 'id_user');
    }
}
