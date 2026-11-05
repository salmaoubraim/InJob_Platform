<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Support\CandidatureNotificationPresenter;
use App\Support\NotificationReadStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = min((int) $request->get('limit', 50), 100);

        $items = Notification::query()
            ->where('id_user', $user->id_user)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $items->map(fn ($n) => $this->format($n)),
            'unread_count' => NotificationReadStatus::unreadCount($user->id_user),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'unread_count' => NotificationReadStatus::unreadCount($request->user()->id_user),
        ]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $notif = Notification::where('id_user', $request->user()->id_user)->findOrFail($id);
        NotificationReadStatus::markRead($notif);

        return response()->json([
            'message' => 'Notification marquée comme lue.',
            'data' => $this->format($notif->fresh()),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        NotificationReadStatus::markAllRead($request->user()->id_user);

        return response()->json(['message' => 'Toutes les notifications sont lues.']);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $notif = Notification::where('id_user', $request->user()->id_user)->findOrFail($id);
        $notif->delete();

        return response()->json(['message' => 'Notification supprimée.']);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $deleted = Notification::where('id_user', $request->user()->id_user)->delete();

        return response()->json([
            'message' => $deleted > 0
                ? "{$deleted} notification(s) supprimée(s)."
                : 'Aucune notification à supprimer.',
            'deleted' => $deleted,
        ]);
    }

    private function format(Notification $n): array
    {
        $message = $n->message ?? $n->contenu ?? '';
        $type = $n->type ?? $n->type_notification ?? null;

        $formatted = [
            'id_notification' => $n->id_notification,
            'type' => $type,
            'titre' => $n->titre,
            'message' => $message,
            'lien' => $n->lien,
            'lu' => NotificationReadStatus::isRead($n),
            'created_at' => $n->created_at?->toIso8601String(),
            'date_label' => $n->created_at?->locale('fr')->diffForHumans(),
            'candidat_nom' => null,
            'offre_titre' => null,
        ];

        return CandidatureNotificationPresenter::enrich($formatted, $n);
    }
}
