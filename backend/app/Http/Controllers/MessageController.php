<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Utilisateur;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id_user;

        $messages = Message::with(['expediteurUser', 'destinataireUser'])
            ->where(function ($q) use ($userId) {
                $q->where('expediteur', $userId)
                    ->orWhere('destinataire', $userId);
            })
            ->orderBy('date_envoi')
            ->get();

        $partners = [];
        foreach ($messages as $msg) {
            $partnerId = $msg->expediteur === $userId ? $msg->destinataire : $msg->expediteur;
            if (! isset($partners[$partnerId])) {
                $partner = $msg->expediteur === $userId
                    ? $msg->destinataireUser
                    : $msg->expediteurUser;
                $partners[$partnerId] = [
                    'id_user' => $partnerId,
                    'nom' => $partner?->nom,
                    'prenom' => $partner?->prenom,
                    'role' => $partner?->role,
                    'photo_url' => $this->photoUrl($partner),
                    'messages' => [],
                    'unread_count' => 0,
                ];
            }
            $formatted = $this->formatMessage($msg, $userId);
            $partners[$partnerId]['messages'][] = $formatted;
            if (! $formatted['is_mine'] && ! $formatted['lu']) {
                $partners[$partnerId]['unread_count']++;
            }
        }

        return response()->json([
            'data' => array_values($partners),
            'flat' => $messages->map(fn ($m) => $this->formatMessage($m, $userId)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destinataire' => ['required', 'exists:utilisateurs,id_user'],
            'contenu' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        if ((int) $validated['destinataire'] === $request->user()->id_user) {
            return response()->json(['message' => 'Vous ne pouvez pas vous envoyer un message.'], 422);
        }

        $destinataire = Utilisateur::findOrFail($validated['destinataire']);

        $payload = [
            'expediteur' => $request->user()->id_user,
            'destinataire' => $destinataire->id_user,
            'contenu' => $validated['contenu'],
            'date_envoi' => now(),
        ];
        if (Schema::hasColumn('messages', 'lu')) {
            $payload['lu'] = false;
        }

        $message = Message::create($payload);

        $message->load(['expediteurUser', 'destinataireUser']);

        $expediteurNom = trim($request->user()->prenom.' '.$request->user()->nom);
        $lien = $destinataire->role === 'recruteur'
            ? '/recruteur/messagerie'
            : ($destinataire->role === 'admin' ? '/admin/messages' : '/candidat/messagerie');

        NotificationService::send(
            $destinataire->id_user,
            'message',
            'Nouveau message',
            "{$expediteurNom} vous a envoyé un message.",
            $lien.'?to='.$request->user()->id_user
        );

        return response()->json([
            'message' => 'Message envoyé.',
            'data' => $this->formatMessage($message, $request->user()->id_user),
        ], 201);
    }

    public function markRead(Request $request, int $partnerId): JsonResponse
    {
        if (! Schema::hasColumn('messages', 'lu')) {
            return response()->json(['message' => 'OK']);
        }

        Message::where('expediteur', $partnerId)
            ->where('destinataire', $request->user()->id_user)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json(['message' => 'Messages marqués comme lus.']);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $message = Message::findOrFail($id);

        if ($message->expediteur !== $request->user()->id_user) {
            return response()->json(['message' => 'Vous ne pouvez modifier que vos messages.'], 403);
        }

        $validated = $request->validate([
            'contenu' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        $message->update(['contenu' => $validated['contenu']]);
        $message->load(['expediteurUser', 'destinataireUser']);

        return response()->json([
            'message' => 'Message modifié.',
            'data' => $this->formatMessage($message, $request->user()->id_user),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $message = Message::findOrFail($id);

        if ($message->expediteur !== $request->user()->id_user) {
            return response()->json(['message' => 'Vous ne pouvez supprimer que vos messages.'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }

    public function destroyConversation(Request $request, int $partnerId): JsonResponse
    {
        $userId = $request->user()->id_user;

        if ((int) $partnerId === $userId) {
            return response()->json(['message' => 'Conversation invalide.'], 422);
        }

        $deleted = Message::query()
            ->where(function ($q) use ($userId, $partnerId) {
                $q->where(function ($q2) use ($userId, $partnerId) {
                    $q2->where('expediteur', $userId)->where('destinataire', $partnerId);
                })->orWhere(function ($q2) use ($userId, $partnerId) {
                    $q2->where('expediteur', $partnerId)->where('destinataire', $userId);
                });
            })
            ->delete();

        return response()->json([
            'message' => $deleted > 0
                ? "{$deleted} message(s) supprimé(s)."
                : 'Aucun message à supprimer.',
            'deleted' => $deleted,
        ]);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $userId = $request->user()->id_user;

        $deleted = Message::query()
            ->where(function ($q) use ($userId) {
                $q->where('expediteur', $userId)
                    ->orWhere('destinataire', $userId);
            })
            ->delete();

        return response()->json([
            'message' => $deleted > 0
                ? "Messagerie vidée ({$deleted} message(s))."
                : 'Aucun message à supprimer.',
            'deleted' => $deleted,
        ]);
    }

    public function contacts(Request $request): JsonResponse
    {
        $role = $request->user()->role;
        $query = Utilisateur::query()->where('id_user', '!=', $request->user()->id_user);

        if ($role === 'candidat') {
            $query->where('role', 'recruteur');
        } elseif ($role === 'recruteur') {
            $query->where('role', 'candidat');
        } else {
            $query->whereIn('role', ['candidat', 'recruteur']);
        }

        $users = $query->orderBy('prenom')->limit(100)->get(['id_user', 'nom', 'prenom', 'email', 'role', 'photo_profil']);

        return response()->json([
            'data' => $users->map(fn ($u) => [
                'id_user' => $u->id_user,
                'nom' => $u->nom,
                'prenom' => $u->prenom,
                'email' => $u->email,
                'role' => $u->role,
                'photo_url' => $this->photoUrl($u),
                'label' => trim($u->prenom.' '.$u->nom).' ('.$u->role.')',
            ]),
        ]);
    }

    private function formatMessage(Message $m, int $currentUserId): array
    {
        $lu = Schema::hasColumn('messages', 'lu') ? (bool) $m->lu : true;

        return [
            'id_message' => $m->id_message,
            'contenu' => $m->contenu,
            'date_envoi' => $m->date_envoi?->toIso8601String(),
            'date_label' => $m->date_envoi?->locale('fr')->format('d/m/Y H:i'),
            'date_relative' => $m->date_envoi?->locale('fr')->diffForHumans(),
            'expediteur' => $m->expediteur,
            'destinataire' => $m->destinataire,
            'is_mine' => $m->expediteur === $currentUserId,
            'lu' => $m->expediteur === $currentUserId ? true : $lu,
            'expediteur_nom' => $m->expediteurUser
                ? trim($m->expediteurUser->prenom.' '.$m->expediteurUser->nom)
                : null,
            'destinataire_nom' => $m->destinataireUser
                ? trim($m->destinataireUser->prenom.' '.$m->destinataireUser->nom)
                : null,
            'expediteur_photo' => $this->photoUrl($m->expediteurUser),
            'destinataire_photo' => $this->photoUrl($m->destinataireUser),
        ];
    }

    private function photoUrl(?Utilisateur $user): ?string
    {
        if (! $user?->photo_profil) {
            return null;
        }
        $p = $user->photo_profil;
        if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) {
            return $p;
        }

        return url($p);
    }
}
