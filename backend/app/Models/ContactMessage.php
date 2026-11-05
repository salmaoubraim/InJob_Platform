<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    public $timestamps = false;

    protected $table = 'contact_messages';

    protected $fillable = ['nom', 'email', 'message', 'statut', 'reponse_admin', 'date_reponse', 'date_lecture'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'date_reponse' => 'datetime',
            'date_lecture' => 'datetime',
        ];
    }
}
