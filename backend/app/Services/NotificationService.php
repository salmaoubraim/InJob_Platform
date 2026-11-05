<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class NotificationService
{
    public static function send(int $userId, string $type, string $titre, string $message, ?string $lien = null): void
    {
        if (! Schema::hasTable('notifications')) {
            return;
        }

        $payload = [
            'id_user' => $userId,
            'titre' => $titre,
            'created_at' => now(),
        ];

        if (Schema::hasColumn('notifications', 'type')) {
            $payload['type'] = $type;
        }
        if (Schema::hasColumn('notifications', 'type_notification')) {
            $payload['type_notification'] = $type;
        }

        if (Schema::hasColumn('notifications', 'message')) {
            $payload['message'] = $message;
        }
        if (Schema::hasColumn('notifications', 'contenu')) {
            $payload['contenu'] = $message;
        }

        if ($lien !== null && Schema::hasColumn('notifications', 'lien')) {
            $payload['lien'] = $lien;
        }

        if (Schema::hasColumn('notifications', 'lu')) {
            $payload['lu'] = false;
        } elseif (Schema::hasColumn('notifications', 'is_read')) {
            $payload['is_read'] = false;
        }

        try {
            Notification::create($payload);
        } catch (\Throwable $e) {
            Log::warning('Notification insert failed', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
                'type' => $type,
            ]);
        }
    }

    public static function notifyAdmins(string $type, string $titre, string $message, ?string $lien = null): void
    {
        Utilisateur::where('role', 'admin')
            ->pluck('id_user')
            ->each(fn (int $id) => self::send($id, $type, $titre, $message, $lien));
    }
}
