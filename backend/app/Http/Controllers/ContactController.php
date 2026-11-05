<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ], [
            'nom.required' => 'Le nom est obligatoire.',
            'email.required' => 'L\'adresse e-mail est obligatoire.',
            'email.email' => 'L\'adresse e-mail n\'est pas valide.',
            'message.required' => 'Le message est obligatoire.',
            'message.min' => 'Le message doit contenir au moins 10 caractères.',
        ]);

        ContactMessage::create([
            'nom' => $validated['nom'],
            'email' => strtolower(trim($validated['email'])),
            'message' => $validated['message'],
            'statut' => 'nouveau',
        ]);

        try {
            NotificationService::notifyAdmins(
                'contact',
                'Nouveau message contact',
                "{$validated['nom']} — ".substr($validated['message'], 0, 80),
                '/admin/messages'
            );
        } catch (\Throwable) {
            // Le message contact est enregistré même si la notification échoue.
        }

        return response()->json([
            'message' => 'Votre message a bien été envoyé. Nous vous répondrons sous peu.',
        ], 201);
    }
}
