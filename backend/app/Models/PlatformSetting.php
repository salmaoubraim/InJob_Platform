<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class PlatformSetting extends Model
{
    protected $table = 'platform_settings';

    protected $fillable = [
        'site_name',
        'default_language',
        'dark_mode',
        'notify_inscriptions',
        'notify_offres',
        'notify_candidatures',
        'notify_support',
        'notify_avis',
        'notify_security',
        'maintenance_mode',
        'session_timeout_minutes',
    ];

    protected function casts(): array
    {
        return [
            'dark_mode' => 'boolean',
            'notify_inscriptions' => 'boolean',
            'notify_offres' => 'boolean',
            'notify_candidatures' => 'boolean',
            'notify_support' => 'boolean',
            'notify_avis' => 'boolean',
            'notify_security' => 'boolean',
            'maintenance_mode' => 'boolean',
        ];
    }

    public static function current(): self
    {
        if (! Schema::hasTable('platform_settings')) {
            return new self([
                'site_name' => 'InJob',
                'default_language' => 'fr',
                'dark_mode' => false,
                'notify_inscriptions' => true,
                'notify_offres' => true,
                'notify_candidatures' => true,
                'notify_support' => true,
                'notify_avis' => true,
                'notify_security' => true,
                'maintenance_mode' => false,
            ]);
        }

        return self::query()->firstOrCreate([], [
            'site_name' => 'InJob',
            'default_language' => 'fr',
        ]);
    }
}
