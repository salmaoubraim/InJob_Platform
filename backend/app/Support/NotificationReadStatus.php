<?php

namespace App\Support;

use App\Models\Notification;
use Illuminate\Support\Facades\Schema;

class NotificationReadStatus
{
    public static function hasReadColumn(): bool
    {
        if (! Schema::hasTable('notifications')) {
            return false;
        }

        return Schema::hasColumn('notifications', 'lu')
            || Schema::hasColumn('notifications', 'is_read');
    }

    public static function unreadCount(int $userId): int
    {
        if (! Schema::hasTable('notifications')) {
            return 0;
        }

        if (Schema::hasColumn('notifications', 'lu')) {
            return Notification::where('id_user', $userId)->where('lu', false)->count();
        }

        if (Schema::hasColumn('notifications', 'is_read')) {
            return Notification::where('id_user', $userId)->where('is_read', false)->count();
        }

        return 0;
    }

    public static function isRead(Notification $notification): bool
    {
        if (Schema::hasColumn('notifications', 'lu')) {
            return (bool) $notification->lu;
        }

        if (Schema::hasColumn('notifications', 'is_read')) {
            return (bool) $notification->is_read;
        }

        return true;
    }

    public static function markAllRead(int $userId): void
    {
        if (Schema::hasColumn('notifications', 'lu')) {
            Notification::where('id_user', $userId)->where('lu', false)->update(['lu' => true]);
        } elseif (Schema::hasColumn('notifications', 'is_read')) {
            Notification::where('id_user', $userId)->where('is_read', false)->update(['is_read' => true]);
        }
    }

    public static function markRead(Notification $notification): void
    {
        if (Schema::hasColumn('notifications', 'lu')) {
            $notification->update(['lu' => true]);
        } elseif (Schema::hasColumn('notifications', 'is_read')) {
            $notification->update(['is_read' => true]);
        }
    }
}
