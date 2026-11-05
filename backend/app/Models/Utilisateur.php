<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'utilisateurs';

    protected $primaryKey = 'id_user';

    public $timestamps = false;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'google_id',
        'auth_provider',
        'mot_de_passe',
        'telephone',
        'photo_profil',
        'role',
        'est_actif',
    ];

    protected $hidden = [
        'mot_de_passe',
    ];

    protected function casts(): array
    {
        return [
            'mot_de_passe' => 'hashed',
            'est_actif' => 'boolean',
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->mot_de_passe;
    }

    public function candidat(): HasOne
    {
        return $this->hasOne(Candidat::class, 'id_user', 'id_user');
    }

    public function recruteur(): HasOne
    {
        return $this->hasOne(Recruteur::class, 'id_user', 'id_user');
    }

    public function administrateur(): HasOne
    {
        return $this->hasOne(Administrateur::class, 'id_user', 'id_user');
    }

    public function messagesEnvoyes()
    {
        return $this->hasMany(Message::class, 'expediteur', 'id_user');
    }

    public function messagesRecus()
    {
        return $this->hasMany(Message::class, 'destinataire', 'id_user');
    }
}
