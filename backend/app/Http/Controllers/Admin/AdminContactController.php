<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Utilisateur;
use App\Support\UserPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $q = ContactMessage::query();
        if ($statut = $request->query('statut')) {
            $q->where('statut', $statut);
        }
        if ($search = trim((string) $request->query('q', ''))) {
            $q->where(function ($b) use ($search) {
                $b->where('nom', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $paginated = $q->orderByDesc('created_at')->paginate(min(50, (int) $request->query('per_page', 30)));
        $photosByEmail = $this->photosByEmails(
            collect($paginated->items())->pluck('email')->filter()->all()
        );

        return response()->json([
            'data' => collect($paginated->items())->map(
                fn ($m) => $this->format($m, $photosByEmail[strtolower(trim((string) $m->email))] ?? null)
            ),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
                'unread_count' => $this->countUnreadMessages(),
            ],
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        return response()->json([
            'count' => $this->countUnreadMessages(),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $msg = ContactMessage::findOrFail($id);
        $photos = $this->photosByEmails([$msg->email]);

        return response()->json([
            'data' => $this->format(
                $this->markAsRead($msg),
                $photos[strtolower(trim((string) $msg->email))] ?? null
            ),
        ]);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $validated = $request->validate([
            'reponse' => ['required', 'string', 'min:2', 'max:5000'],
        ], [
            'reponse.required' => 'La réponse est obligatoire.',
            'reponse.min' => 'La réponse doit contenir au moins 2 caractères.',
        ]);

        $msg = ContactMessage::findOrFail($id);

        $saved = $this->saveReply($msg, $validated['reponse']);
        $photos = $this->photosByEmails([$saved->email]);

        return response()->json([
            'message' => 'Réponse enregistrée.',
            'data' => $this->format(
                $saved,
                $photos[strtolower(trim((string) $saved->email))] ?? null
            ),
        ]);
    }

    public function updateReply(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $validated = $request->validate([
            'reponse' => ['required', 'string', 'min:2', 'max:5000'],
        ], [
            'reponse.required' => 'La réponse est obligatoire.',
            'reponse.min' => 'La réponse doit contenir au moins 2 caractères.',
        ]);

        $msg = ContactMessage::findOrFail($id);
        if (! $msg->reponse_admin) {
            return response()->json(['message' => 'Aucune réponse à modifier.'], 422);
        }

        $saved = $this->saveReply($msg, $validated['reponse']);
        $photos = $this->photosByEmails([$saved->email]);

        return response()->json([
            'message' => 'Réponse modifiée.',
            'data' => $this->format(
                $saved,
                $photos[strtolower(trim((string) $saved->email))] ?? null
            ),
        ]);
    }

    public function clearReply(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $msg = ContactMessage::findOrFail($id);
        if (! $msg->reponse_admin) {
            return response()->json(['message' => 'Aucune réponse à supprimer.'], 422);
        }

        $msg->update([
            'reponse_admin' => null,
            'date_reponse' => null,
            'statut' => 'lu',
        ]);

        $fresh = $msg->fresh();
        $photos = $this->photosByEmails([$fresh->email]);

        return response()->json([
            'message' => 'Réponse supprimée.',
            'data' => $this->format(
                $fresh,
                $photos[strtolower(trim((string) $fresh->email))] ?? null
            ),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        ContactMessage::findOrFail($id)->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }
        $deleted = ContactMessage::query()->delete();

        return response()->json([
            'message' => $deleted > 0 ? "{$deleted} message(s) supprimé(s)." : 'Aucun message.',
            'deleted' => $deleted,
        ]);
    }

    public function markContactRead(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = strtolower(trim($validated['email']));
        ContactMessage::whereRaw('LOWER(email) = ?', [$email])
            ->where('statut', 'nouveau')
            ->update([
                'statut' => 'lu',
                'date_lecture' => now(),
            ]);

        return response()->json(['message' => 'Contact marqué comme lu.']);
    }

    public function clearAllReplies(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $count = ContactMessage::whereNotNull('reponse_admin')->count();
        ContactMessage::whereNotNull('reponse_admin')->update([
            'reponse_admin' => null,
            'date_reponse' => null,
            'statut' => 'lu',
        ]);

        return response()->json([
            'message' => $count > 0 ? 'Réponses vidées.' : 'Aucune réponse à vider.',
            'cleared' => $count,
        ]);
    }

    public function clearContactReplies(Request $request): JsonResponse
    {
        if ($denied = $this->ensureAdmin($request)) {
            return $denied;
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = strtolower(trim($validated['email']));
        $count = ContactMessage::whereRaw('LOWER(email) = ?', [$email])
            ->whereNotNull('reponse_admin')
            ->count();

        ContactMessage::whereRaw('LOWER(email) = ?', [$email])
            ->whereNotNull('reponse_admin')
            ->update([
                'reponse_admin' => null,
                'date_reponse' => null,
                'statut' => 'lu',
            ]);

        return response()->json([
            'message' => $count > 0 ? 'Conversation vidée.' : 'Aucun message à vider.',
            'cleared' => $count,
        ]);
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return null;
    }

    private function countUnreadMessages(): int
    {
        return (int) ContactMessage::where('statut', 'nouveau')->count();
    }

    private function markAsRead(ContactMessage $msg): ContactMessage
    {
        $updates = ['date_lecture' => now()];

        if ($msg->statut === 'nouveau') {
            $updates['statut'] = 'lu';
        }

        $msg->update($updates);

        return $msg->fresh();
    }

    private function saveReply(ContactMessage $msg, string $reponse): ContactMessage
    {
        $msg->update([
            'reponse_admin' => $reponse,
            'date_reponse' => now(),
            'date_lecture' => now(),
            'statut' => 'repondu',
        ]);

        return $msg->fresh();
    }

    /** @param  array<string, array{photo_profil: ?string, photo_url: ?string, role: ?string}>  $emails */
    private function photosByEmails(array $emails): array
    {
        $normalized = collect($emails)
            ->map(fn ($e) => strtolower(trim((string) $e)))
            ->filter()
            ->unique()
            ->values()
            ->all();

        if ($normalized === []) {
            return [];
        }

        $users = Utilisateur::query()
            ->where(function ($q) use ($normalized) {
                foreach ($normalized as $email) {
                    $q->orWhereRaw('LOWER(email) = ?', [$email]);
                }
            })
            ->get(['email', 'photo_profil', 'role']);

        $map = [];
        foreach ($users as $user) {
            $key = strtolower(trim((string) $user->email));
            $map[$key] = [
                'photo_profil' => $user->photo_profil,
                'photo_url' => UserPresenter::photoUrl($user->photo_profil),
                'role' => $user->role,
            ];
        }

        return $map;
    }

    private function format(ContactMessage $m, ?array $profile = null): array
    {
        $statut = $m->statut ?? 'nouveau';

        return [
            'id' => $m->id,
            'nom' => $m->nom,
            'email' => $m->email,
            'photo_profil' => $profile['photo_profil'] ?? null,
            'photo_url' => $profile['photo_url'] ?? null,
            'role' => $profile['role'] ?? null,
            'message' => $m->message,
            'statut' => $statut,
            'est_lu' => $statut !== 'nouveau',
            'is_unread' => $statut === 'nouveau',
            'reponse_admin' => $m->reponse_admin,
            'date_label' => $m->created_at?->locale('fr')->diffForHumans(),
            'created_at' => $m->created_at?->format('d/m/Y H:i'),
            'date_reponse' => $m->date_reponse?->format('d/m/Y H:i'),
            'date_lecture' => $m->date_lecture?->format('d/m/Y H:i'),
        ];
    }
}
